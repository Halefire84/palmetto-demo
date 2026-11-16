// CRTC AI Automation Engine — reusable workflow core
// Each customer passes a CONFIG object; Palmetto is the first tenant.
// No external dependencies. Runs in-browser for demos; replace storage
// adapter with fetch() calls to wire a real backend.

(function(global) {
  "use strict";

  // ── Storage adapter (swap this for API calls in production) ──────────
  var store = {
    get: function(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } },
    set: function(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
    del: function(k) { localStorage.removeItem(k); }
  };

  // ── Engine factory ────────────────────────────────────────────────────
  function createEngine(config) {
    var ns = config.namespace || "crtc";       // key prefix keeps tenants isolated

    function key(k) { return ns + "_" + k; }

    // ── Leads ────────────────────────────────────────────────────────────
    function getLeads() { return store.get(key("leads")) || []; }
    function saveLeads(arr) { store.set(key("leads"), arr); }

    function getLead(id) {
      return getLeads().find(function(l) { return l.id === id; }) || null;
    }

    function createLead(fields) {
      var leads = getLeads();
      // Dedup: same phone + same description submitted within 5 min
      var now = Date.now();
      var dup = leads.find(function(l) {
        return l.phone === fields.phone &&
               l.description === fields.description &&
               (now - new Date(l.at).getTime()) < 5 * 60 * 1000;
      });
      if (dup) return { lead: dup, isDuplicate: true };

      var id = ns.toUpperCase() + "-" + now;
      var classification = classify(fields.service, fields.urgency, fields.description, config);
      var lead = Object.assign({}, fields, {
        id: id,
        at: new Date().toISOString(),
        status: "NEW",
        classification: classification,
        activity: [{ at: new Date().toISOString(), event: "Lead created", detail: "Source: " + (fields.source || "website") }]
      });
      leads.unshift(lead);
      saveLeads(leads);
      return { lead: lead, isDuplicate: false };
    }

    function updateLead(id, patch) {
      var leads = getLeads();
      var idx = leads.findIndex(function(l) { return l.id === id; });
      if (idx === -1) return null;
      leads[idx] = Object.assign({}, leads[idx], patch);
      if (patch.statusChange) {
        leads[idx].activity = (leads[idx].activity || []).concat([{
          at: new Date().toISOString(), event: "Status → " + patch.status, detail: patch.statusChange
        }]);
      }
      saveLeads(leads);
      return leads[idx];
    }

    function clearLeads() { store.del(key("leads")); }

    // ── Notifications ────────────────────────────────────────────────────
    function getNotifications() { return store.get(key("notifications")) || []; }
    function pushNotification(msg, level) {
      var notes = getNotifications();
      notes.unshift({ at: new Date().toISOString(), msg: msg, level: level || "info", read: false });
      if (notes.length > 100) notes = notes.slice(0, 100);
      store.set(key("notifications"), notes);
    }
    function markAllRead() {
      var notes = getNotifications().map(function(n) { return Object.assign({}, n, { read: true }); });
      store.set(key("notifications"), notes);
    }

    // ── Appointments ─────────────────────────────────────────────────────
    function getAppointments() { return store.get(key("appointments")) || []; }
    function bookAppointment(leadId, slot, service) {
      var appts = getAppointments();
      var conflict = appts.find(function(a) { return a.slot === slot && a.status !== "CANCELLED"; });
      if (conflict) return { ok: false, error: "Slot " + slot + " already booked." };
      var appt = { id: "APT-" + Date.now(), leadId: leadId, slot: slot, service: service,
                   bookedAt: new Date().toISOString(), status: "CONFIRMED" };
      appts.push(appt);
      store.set(key("appointments"), appts);
      updateLead(leadId, { status: "BOOKED", appointmentId: appt.id,
                           statusChange: "Appointment confirmed: " + slot });
      return { ok: true, appt: appt };
    }

    // ── Error log ────────────────────────────────────────────────────────
    function getErrors() { return store.get(key("errors")) || []; }
    function logError(ctx, msg, retryable) {
      var errs = getErrors();
      errs.unshift({ at: new Date().toISOString(), ctx: ctx, msg: msg,
                     retryable: !!retryable, resolved: false });
      if (errs.length > 200) errs = errs.slice(0, 200);
      store.set(key("errors"), errs);
    }
    function resolveError(idx) {
      var errs = getErrors();
      if (errs[idx]) { errs[idx].resolved = true; store.set(key("errors"), errs); }
    }

    // ── Opt-outs ─────────────────────────────────────────────────────────
    function getOptOuts() { return store.get(key("optouts")) || []; }
    function optOut(phone) {
      var list = getOptOuts();
      if (!list.includes(phone)) { list.push(phone); store.set(key("optouts"), list); }
    }
    function isOptedOut(phone) { return getOptOuts().includes(phone); }

    // ── Full workflow ─────────────────────────────────────────────────────
    function processInquiry(fields) {
      var steps = [];
      function step(name, fn) {
        try {
          var result = fn();
          steps.push({ step: name, status: "PASS", detail: result });
          return result;
        } catch(e) {
          steps.push({ step: name, status: "FAIL", detail: e.message });
          logError(name, e.message, true);
          return null;
        }
      }

      // 1. Validate
      var validated = step("validate", function() {
        if (!fields.name) throw new Error("Missing name");
        if (!fields.phone || fields.phone.replace(/\D/g,"").length < 7) throw new Error("Invalid phone");
        if (!fields.service) throw new Error("Missing service");
        if (!fields.description || fields.description.length < 5) throw new Error("Description too short");
        return "OK";
      });
      if (!validated) return { ok: false, steps: steps };

      // 2. Opt-out check
      step("opt_out_check", function() {
        if (isOptedOut(fields.phone)) throw new Error("Phone " + fields.phone + " is opted out");
        return "Not opted out";
      });
      var optedOut = steps.find(function(s){ return s.step==="opt_out_check"&&s.status==="FAIL"; });
      if (optedOut) return { ok: false, steps: steps, optedOut: true };

      // 3. Create lead (dedup handled inside)
      var createResult = step("create_lead", function() {
        var r = createLead(fields);
        if (r.isDuplicate) return "DUPLICATE:" + r.lead.id;
        return r.lead.id;
      });
      if (!createResult) return { ok: false, steps: steps };

      var isDuplicate = createResult.startsWith("DUPLICATE:");
      var leadId = isDuplicate ? createResult.split(":")[1] : createResult;
      var lead = getLead(leadId);

      // 4. Classify
      step("classify", function() {
        return "Category=" + lead.classification.category + " Urgency=" + lead.classification.urgency +
               " Score=" + lead.classification.score;
      });

      // 5. Generate auto-response
      var autoResp = step("auto_response", function() {
        return lead.classification.autoResponse;
      });

      // 6. Owner notification
      step("owner_notify", function() {
        var msg = (lead.classification.urgency === "emergency" ? "🚨 URGENT" : "📥 New") +
                  " lead " + leadId + ": " + lead.name + " — " + lead.service;
        pushNotification(msg, lead.classification.urgency === "emergency" ? "urgent" : "info");
        return "Notification pushed";
      });

      // 7. Update status
      step("update_status", function() {
        updateLead(leadId, { status: isDuplicate ? "DUPLICATE" : "CONTACTED",
                             autoResponse: autoResp,
                             statusChange: isDuplicate ? "Duplicate suppressed" : "Auto-response sent" });
        return isDuplicate ? "Duplicate — no duplicate action taken" : "Status → CONTACTED";
      });

      return { ok: true, leadId: leadId, isDuplicate: isDuplicate, lead: getLead(leadId), steps: steps };
    }

    // ── Classify ─────────────────────────────────────────────────────────
    function classify(service, urgency, desc, cfg) {
      var score = { routine: 50, soon: 65, urgent: 80, emergency: 95 }[urgency] || 50;
      var kw = (desc || "").toLowerCase();
      if (/leak|flood|burst|no heat|no ac|no power|sparking|smoke|gas smell/.test(kw)) {
        score = Math.max(score, 90); urgency = "emergency";
      }
      var templates = (cfg && cfg.responseTemplates) || {};
      var autoResponse = templates[service] || templates["default"] ||
        "Thanks for reaching out! We'll call you shortly to get the details.";
      return { category: service || "General", urgency: urgency, score: score,
               urgent: urgency === "emergency" || urgency === "urgent",
               autoResponse: autoResponse };
    }

    return {
      config: config,
      leads: { get: getLeads, getOne: getLead, create: createLead, update: updateLead, clear: clearLeads },
      notifications: { get: getNotifications, push: pushNotification, markAllRead: markAllRead },
      appointments: { get: getAppointments, book: bookAppointment },
      errors: { get: getErrors, log: logError, resolve: resolveError },
      optouts: { optOut: optOut, isOptedOut: isOptedOut },
      workflow: { processInquiry: processInquiry }
    };
  }

  global.CRTCEngine = { create: createEngine };

})(typeof window !== "undefined" ? window : global);
