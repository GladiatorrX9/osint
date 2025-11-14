import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Create single ADMIN user
  const hashedPassword = await hash("GladiatorrX@2024!", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gladiatorrx.com" },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email: "admin@gladiatorrx.com",
      name: "GladiatorrX Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✓ Created admin user");

  // Create dummy organizations with users
  const organizations = [
    {
      name: "TechCorp Solutions",
      slug: "techcorp-solutions",
      subscription: {
        plan: "ENTERPRISE" as const,
        interval: "YEARLY" as const,
      },
      users: [
        {
          email: "john.doe@techcorp.com",
          name: "John Doe",
          role: "ADMIN",
          teamRole: "OWNER",
        },
        {
          email: "jane.smith@techcorp.com",
          name: "Jane Smith",
          role: "USER",
          teamRole: "ADMIN",
        },
        {
          email: "mike.johnson@techcorp.com",
          name: "Mike Johnson",
          role: "USER",
          teamRole: "MEMBER",
        },
      ],
    },
    {
      name: "StartupHub Inc",
      slug: "startuphub-inc",
      subscription: {
        plan: "PROFESSIONAL" as const,
        interval: "MONTHLY" as const,
      },
      users: [
        {
          email: "sarah.wilson@startuphub.com",
          name: "Sarah Wilson",
          role: "USER",
          teamRole: "OWNER",
        },
        {
          email: "david.brown@startuphub.com",
          name: "David Brown",
          role: "USER",
          teamRole: "MEMBER",
        },
      ],
    },
    {
      name: "Global Enterprises",
      slug: "global-enterprises",
      subscription: {
        plan: "STARTER" as const,
        interval: "MONTHLY" as const,
      },
      users: [
        {
          email: "alex.rodriguez@global.com",
          name: "Alex Rodriguez",
          role: "USER",
          teamRole: "OWNER",
        },
        {
          email: "emily.davis@global.com",
          name: "Emily Davis",
          role: "USER",
          teamRole: "ADMIN",
        },
        {
          email: "robert.martinez@global.com",
          name: "Robert Martinez",
          role: "USER",
          teamRole: "MEMBER",
        },
        {
          email: "lisa.anderson@global.com",
          name: "Lisa Anderson",
          role: "USER",
          teamRole: "VIEWER",
        },
      ],
    },
    {
      name: "Digital Innovations",
      slug: "digital-innovations",
      subscription: {
        plan: "PROFESSIONAL" as const,
        interval: "YEARLY" as const,
      },
      users: [
        {
          email: "chris.taylor@digitalinno.com",
          name: "Chris Taylor",
          role: "USER",
          teamRole: "OWNER",
        },
        {
          email: "amanda.white@digitalinno.com",
          name: "Amanda White",
          role: "USER",
          teamRole: "MEMBER",
        },
      ],
    },
    {
      name: "CloudTech Systems",
      slug: "cloudtech-systems",
      subscription: {
        plan: "ENTERPRISE" as const,
        interval: "MONTHLY" as const,
      },
      users: [
        {
          email: "kevin.lee@cloudtech.com",
          name: "Kevin Lee",
          role: "USER",
          teamRole: "OWNER",
        },
        {
          email: "michelle.garcia@cloudtech.com",
          name: "Michelle Garcia",
          role: "USER",
          teamRole: "ADMIN",
        },
        {
          email: "daniel.thomas@cloudtech.com",
          name: "Daniel Thomas",
          role: "USER",
          teamRole: "MEMBER",
        },
        {
          email: "jessica.moore@cloudtech.com",
          name: "Jessica Moore",
          role: "USER",
          teamRole: "MEMBER",
        },
        {
          email: "brian.jackson@cloudtech.com",
          name: "Brian Jackson",
          role: "USER",
          teamRole: "VIEWER",
        },
      ],
    },
  ];

  // Password for all dummy users
  const dummyPassword = await hash("Password123!", 12);

  for (const orgData of organizations) {
    console.log(`\nCreating organization: ${orgData.name}`);

    // Create or get organization
    const organization = await prisma.organization.upsert({
      where: { slug: orgData.slug },
      update: {},
      create: {
        name: orgData.name,
        slug: orgData.slug,
      },
    });

    // Create or update subscription for organization
    const subscription = await prisma.subscription.upsert({
      where: { organizationId: organization.id },
      update: {},
      create: {
        organizationId: organization.id,
        plan: orgData.subscription.plan,
        interval: orgData.subscription.interval,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          Date.now() +
            (orgData.subscription.interval === "YEARLY"
              ? 365 * 24 * 60 * 60 * 1000
              : 30 * 24 * 60 * 60 * 1000)
        ),
      },
    });

    console.log(`   ✓ Created ${orgData.subscription.plan} subscription`);

    // Create users and team members
    for (const userData of orgData.users) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          name: userData.name,
          password: dummyPassword,
          role: userData.role,
          organizationId: organization.id,
        },
      });

      // Create team member relationship
      const existingTeamMember = await prisma.teamMember.findFirst({
        where: {
          userId: user.id,
          organizationId: organization.id,
        },
      });

      if (!existingTeamMember) {
        await prisma.teamMember.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: userData.teamRole,
            status: "ACTIVE",
          },
        });
      }

      console.log(`   ✓ Created user: ${userData.name} (${userData.teamRole})`);
    }
  }

  // Create some users without organizations
  const unassignedUsers = [
    { email: "freelancer1@example.com", name: "Tom Freelancer" },
    { email: "freelancer2@example.com", name: "Anna Independent" },
    { email: "consultant@example.com", name: "Sam Consultant" },
  ];

  console.log("\nCreating unassigned users...");
  for (const userData of unassignedUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password: dummyPassword,
        role: "USER",
      },
    });
    console.log(`   ✓ Created: ${userData.name}`);
  }

  // Create some waitlist entries
  const waitlistEntries = [
    {
      email: "waitlist1@example.com",
      name: "Peter Waiting",
      company: "Startup ABC",
      message: "Looking forward to using GladiatorrX!",
      status: "PENDING",
    },
    {
      email: "waitlist2@example.com",
      name: "Maria Pending",
      company: "Tech Ventures",
      message: "Interested in enterprise features",
      status: "PENDING",
    },
    {
      email: "approved@example.com",
      name: "Jack Approved",
      company: "Big Corp",
      message: "Need OSINT tools ASAP",
      status: "APPROVED",
    },
    {
      email: "rejected@example.com",
      name: "Bob Rejected",
      company: null,
      message: "Just checking it out",
      status: "REJECTED",
    },
  ];

  console.log("\nCreating waitlist entries...");
  for (const entry of waitlistEntries) {
    await prisma.waitlist.upsert({
      where: { email: entry.email },
      update: {},
      create: entry,
    });
    console.log(`   ✓ Created: ${entry.name} (${entry.status})`);
  }

  // Create some pending invitations
  console.log("\nCreating pending invitations...");
  const techCorpOrg = await prisma.organization.findUnique({
    where: { slug: "techcorp-solutions" },
    include: { users: true },
  });

  if (techCorpOrg && techCorpOrg.users.length > 0) {
    const inviter = techCorpOrg.users[0];

    const existingInvite1 = await prisma.invitation.findFirst({
      where: {
        email: "newhire@example.com",
        organizationId: techCorpOrg.id,
        status: "PENDING",
      },
    });

    if (!existingInvite1) {
      await prisma.invitation.create({
        data: {
          email: "newhire@example.com",
          role: "MEMBER",
          organizationId: techCorpOrg.id,
          invitedById: inviter.id,
          token: `invite-${Date.now()}-1`,
          status: "PENDING",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
      console.log("   ✓ Created invitation to newhire@example.com");
    }

    const existingInvite2 = await prisma.invitation.findFirst({
      where: {
        email: "contractor@example.com",
        organizationId: techCorpOrg.id,
        status: "PENDING",
      },
    });

    if (!existingInvite2) {
      await prisma.invitation.create({
        data: {
          email: "contractor@example.com",
          role: "VIEWER",
          organizationId: techCorpOrg.id,
          invitedById: inviter.id,
          token: `invite-${Date.now()}-2`,
          status: "PENDING",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      console.log("   ✓ Created invitation to contractor@example.com");
    }
  }

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

  console.log("✓ Created leaked database records");
  console.log("\nSeeding completed successfully!");
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("SEEDING SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✓ Organizations: ${organizations.length}`);
  console.log(
    `✓ Users: ${
      organizations.reduce((acc, org) => acc + org.users.length, 0) +
      unassignedUsers.length +
      1
    } (including admin)`
  );
  console.log(`✓ Subscriptions: ${organizations.length}`);
  console.log(`✓ Waitlist Entries: ${waitlistEntries.length}`);
  console.log(`✓ Pending Invitations: 2`);
  console.log(`✓ Leaked Databases: ${leakedDatabases.length}`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("ADMIN CREDENTIALS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Email:    admin@gladiatorrx.com");
  console.log("Password: GladiatorrX@2024!");
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("DUMMY USER CREDENTIALS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    "Email:    Any user email from above (e.g., john.doe@techcorp.com)"
  );
  console.log("Password: Password123!");
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("ORGANIZATIONS CREATED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  organizations.forEach((org, idx) => {
    console.log(
      `${idx + 1}. ${org.name} (${org.subscription.plan} - ${
        org.subscription.interval
      })`
    );
    console.log(`   Users: ${org.users.length}`);
  });
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("✗ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
