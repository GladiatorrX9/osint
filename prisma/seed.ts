import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create single ADMIN user
  const hashedPassword = await hash("GladiatorRX@2024!", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gladiatorrx.com" },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email: "admin@gladiatorrx.com",
      name: "GladiatorRX Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Created admin user");

  // Create leaked databases
  const leakedDatabases = [
    {
      name: "LinkedIn Data Breach 2021",
      description:
        "Massive data breach exposing 700 million LinkedIn user records including email addresses, phone numbers, and professional information.",
      source: "Dark Web Forum",
      leakDate: new Date("2021-06-22"),
      recordCount: 700000000,
      dataTypes: JSON.stringify([
        "Email",
        "Phone",
        "Full Name",
        "LinkedIn Profile",
        "Work History",
      ]),
      severity: "critical",
      status: "active",
      affectedOrg: "LinkedIn Corporation",
    },
    {
      name: "Facebook Data Scraping 2021",
      description:
        "Data scraped from 533 million Facebook users across 106 countries, including phone numbers and Facebook IDs.",
      source: "Public Forum Leak",
      leakDate: new Date("2021-04-03"),
      recordCount: 533000000,
      dataTypes: JSON.stringify([
        "Phone",
        "Facebook ID",
        "Full Name",
        "Location",
        "Email",
      ]),
      severity: "critical",
      status: "archived",
      affectedOrg: "Meta Platforms Inc",
    },
    {
      name: "Twitter API Exploitation 2023",
      description:
        "Unauthorized access to Twitter's API resulted in exposure of 235 million email addresses associated with Twitter accounts.",
      source: "API Vulnerability",
      leakDate: new Date("2023-01-05"),
      recordCount: 235000000,
      dataTypes: JSON.stringify(["Email", "Username", "Account Creation Date"]),
      severity: "high",
      status: "investigating",
      affectedOrg: "Twitter Inc",
    },
    {
      name: "Adobe Systems Breach 2013",
      description:
        "Major security breach affecting 38 million Adobe customer accounts with encrypted passwords and payment card information.",
      source: "Server Compromise",
      leakDate: new Date("2013-10-03"),
      recordCount: 38000000,
      dataTypes: JSON.stringify([
        "Email",
        "Encrypted Password",
        "Payment Info",
        "Username",
      ]),
      severity: "critical",
      status: "archived",
      affectedOrg: "Adobe Systems",
    },
    {
      name: "Marriott International Breach 2018",
      description:
        "Starwood guest reservation database breach exposing 500 million guest records including passport numbers.",
      source: "Database Hack",
      leakDate: new Date("2018-11-30"),
      recordCount: 500000000,
      dataTypes: JSON.stringify([
        "Full Name",
        "Email",
        "Phone",
        "Passport Number",
        "Payment Info",
        "Travel History",
      ]),
      severity: "critical",
      status: "archived",
      affectedOrg: "Marriott International",
    },
    {
      name: "Equifax Data Breach 2017",
      description:
        "One of the largest data breaches in history affecting 147 million consumers with highly sensitive personal information.",
      source: "Website Application Vulnerability",
      leakDate: new Date("2017-09-07"),
      recordCount: 147000000,
      dataTypes: JSON.stringify([
        "SSN",
        "Birth Date",
        "Address",
        "Driver's License",
        "Credit Card",
      ]),
      severity: "critical",
      status: "archived",
      affectedOrg: "Equifax Inc",
    },
    {
      name: "Yahoo Data Breach 2013-2014",
      description:
        "The largest known data breach affecting all 3 billion Yahoo user accounts with names, email addresses, and passwords.",
      source: "State-Sponsored Attack",
      leakDate: new Date("2016-12-14"),
      recordCount: 3000000000,
      dataTypes: JSON.stringify([
        "Email",
        "Password",
        "Security Questions",
        "Birth Date",
        "Phone",
      ]),
      severity: "critical",
      status: "archived",
      affectedOrg: "Yahoo Inc",
    },
    {
      name: "T-Mobile Data Breach 2021",
      description:
        "Cybersecurity breach exposing personal data of over 54 million current, former, and prospective T-Mobile customers.",
      source: "Network Intrusion",
      leakDate: new Date("2021-08-16"),
      recordCount: 54000000,
      dataTypes: JSON.stringify([
        "SSN",
        "Driver's License",
        "Full Name",
        "Address",
        "Phone",
        "IMEI",
      ]),
      severity: "high",
      status: "active",
      affectedOrg: "T-Mobile US",
    },
    {
      name: "Microsoft Exchange Server Breach 2021",
      description:
        "Multiple zero-day exploits in Microsoft Exchange Server affecting thousands of organizations worldwide.",
      source: "Zero-Day Vulnerabilities",
      leakDate: new Date("2021-03-02"),
      recordCount: 250000,
      dataTypes: JSON.stringify([
        "Email",
        "Calendar Data",
        "Contact Lists",
        "Corporate Documents",
      ]),
      severity: "critical",
      status: "investigating",
      affectedOrg: "Various Organizations",
    },
    {
      name: "Capital One Data Breach 2019",
      description:
        "Breach of firewall exposed personal information of 100 million credit card applications and accounts.",
      source: "Cloud Misconfiguration",
      leakDate: new Date("2019-07-19"),
      recordCount: 100000000,
      dataTypes: JSON.stringify([
        "SSN",
        "Bank Account",
        "Credit Scores",
        "Income",
        "Address",
      ]),
      severity: "critical",
      status: "archived",
      affectedOrg: "Capital One Financial",
    },
    {
      name: "Uber Data Breach 2016",
      description:
        "Hackers stole personal data of 57 million Uber users and drivers, including names and driver's license numbers.",
      source: "GitHub Repository",
      leakDate: new Date("2017-11-21"),
      recordCount: 57000000,
      dataTypes: JSON.stringify([
        "Full Name",
        "Email",
        "Phone",
        "Driver's License",
      ]),
      severity: "high",
      status: "archived",
      affectedOrg: "Uber Technologies",
    },
    {
      name: "Sony PlayStation Network 2011",
      description:
        "External intrusion on Sony's PlayStation Network and Qriocity services affecting 77 million accounts.",
      source: "Network Hack",
      leakDate: new Date("2011-04-26"),
      recordCount: 77000000,
      dataTypes: JSON.stringify([
        "Email",
        "Password",
        "Full Name",
        "Address",
        "Payment Info",
      ]),
      severity: "high",
      status: "archived",
      affectedOrg: "Sony Corporation",
    },
    {
      name: "eBay Cyberattack 2014",
      description:
        "Database breach compromising 145 million eBay user records with encrypted passwords and personal information.",
      source: "Employee Credentials Theft",
      leakDate: new Date("2014-05-21"),
      recordCount: 145000000,
      dataTypes: JSON.stringify([
        "Email",
        "Encrypted Password",
        "Full Name",
        "Address",
        "Phone",
      ]),
      severity: "high",
      status: "archived",
      affectedOrg: "eBay Inc",
    },
    {
      name: "Dropbox Breach 2012",
      description:
        "Breach affecting 68 million Dropbox user accounts with email addresses and hashed passwords leaked.",
      source: "Employee Password Reuse",
      leakDate: new Date("2016-08-31"),
      recordCount: 68000000,
      dataTypes: JSON.stringify(["Email", "Hashed Password"]),
      severity: "medium",
      status: "archived",
      affectedOrg: "Dropbox Inc",
    },
    {
      name: "GitHub Security Incident 2023",
      description:
        "Unauthorized access to GitHub repositories exposing source code and secrets from multiple organizations.",
      source: "OAuth Token Compromise",
      leakDate: new Date("2023-04-15"),
      recordCount: 5000,
      dataTypes: JSON.stringify([
        "Source Code",
        "API Keys",
        "OAuth Tokens",
        "Repository Data",
      ]),
      severity: "high",
      status: "investigating",
      affectedOrg: "Multiple Tech Companies",
    },
  ];

  for (const db of leakedDatabases) {
    await prisma.leakedDatabase.create({
      data: db,
    });
  }

  console.log("✅ Created leaked database records");
  console.log("🎉 Seeding completed successfully!");
  console.log("\n� Admin Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Email:    admin@gladiatorrx.com");
  console.log("Password: GladiatorRX@2024!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n⚠️  IMPORTANT: Only ADMIN users can login to the platform.");
  console.log("📧 Other users can join the waitlist at /register");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
