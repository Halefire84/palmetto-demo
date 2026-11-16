// Palmetto Home Services — customer configuration
// Swap this file (or fetch it from /api/config/:tenantId) for each real customer.

var PALMETTO_CONFIG = {
  namespace: "palmetto",
  business: {
    name: "Palmetto Home Services",
    phone: "(843) 555-1234",
    email: "demo@palmettohomeservices.test",
    address: "Mount Pleasant, SC 29464",
    hours: "Mon–Sat 7am–7pm, Sun emergency only",
    serviceArea: ["Mount Pleasant", "East Cooper", "Isle of Palms", "Sullivan's Island", "Daniel Island"]
  },
  services: ["Plumbing", "HVAC", "Electrical", "General Repairs", "Appliance Install", "Preventive Maintenance", "Emergency / Not sure"],
  pricing: {
    "Plumbing": { diagnostic: 89, range: "$89–$450 depending on scope" },
    "HVAC": { diagnostic: 99, range: "$99 tune-up, $200–$3,500 repairs/installs" },
    "Electrical": { diagnostic: 95, range: "$95–$600 depending on job" },
    "General Repairs": { diagnostic: 0, range: "$75/hr labor + materials" },
    "Appliance Install": { diagnostic: 0, range: "$125–$250 flat rate" },
    "Preventive Maintenance": { diagnostic: 0, range: "$99/visit" }
  },
  responseTemplates: {
    "Plumbing": "Thanks for reaching out to Palmetto Home Services! We handle plumbing throughout Mount Pleasant and East Cooper. Someone will call you within the hour to get more details and schedule a time.",
    "HVAC": "Got it — HVAC is our specialty. We'll call you shortly to do a quick phone diagnosis and get a tech on the schedule.",
    "Electrical": "Electrical inquiry received. A licensed electrician will call you back within the hour to get the details and set up a visit.",
    "General Repairs": "Thanks! For general repairs we're usually able to visit within a few days. We'll call to confirm the scope and timing.",
    "Appliance Install": "Appliance installs are typically same or next-day. We'll call to confirm the appliance type and schedule.",
    "Preventive Maintenance": "Smart move — tune-ups and maintenance save big money later. We'll call to find a convenient time.",
    "Emergency / Not sure": "On it. We handle emergencies 7 days a week. Someone will call you within 15 minutes.",
    "default": "Thanks for reaching out to Palmetto Home Services! We'll call you back shortly to get the details and schedule a visit."
  },
  followUpRules: {
    newLeadFollowUpHours: 2,
    noResponseFollowUpDays: 2,
    maxFollowUps: 2
  }
};
