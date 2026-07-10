import {
  validatePayload,
  hasPrototypePollution,
  createProjectSchema,
  getProjectsQuerySchema,
  authSchema,
  updateProjectSchema,
  saveQuoteSchema,
  createOrderSchema,
  verifyPaymentSchema,
  uploadAssetSchema,
  adminVerifySchema,
  recommendationSchema,
  packageUpgradeSchema
} from "./server/validator.js";

interface TestCase {
  name: string;
  payload: any;
  shouldPass: boolean;
}

const endpoints = [
  { name: "POST /api/projects", schema: createProjectSchema },
  { name: "GET /api/projects", schema: getProjectsQuerySchema },
  { name: "POST /api/auth/signup", schema: authSchema },
  { name: "POST /api/auth/login", schema: authSchema },
  { name: "PUT /api/projects/:id", schema: updateProjectSchema },
  { name: "POST /api/projects/:id/quote", schema: saveQuoteSchema },
  { name: "POST /api/projects/:id/razorpay-order", schema: createOrderSchema },
  { name: "POST /api/projects/:id/verify-payment", schema: verifyPaymentSchema },
  { name: "POST /api/projects/:id/upload", schema: uploadAssetSchema },
  { name: "POST /api/admin/verify", schema: adminVerifySchema },
  { name: "POST /api/recommendation", schema: recommendationSchema },
  { name: "POST /api/start-project/package-upgrade-options", schema: packageUpgradeSchema }
];

console.log("=====================================================");
console.log("      CODEFUSER SCHEMA VALIDATION AUTOMATED TESTS    ");
console.log("=====================================================");

let totalTests = 0;
let passedTests = 0;

function runTestCase(endpointName: string, schema: any, testCase: TestCase) {
  totalTests++;
  
  // Prototype pollution pre-check
  let protoPolluted = hasPrototypePollution(testCase.payload);
  let errors = protoPolluted ? [{ field: "payload", message: "Prototype pollution detected" }] : validatePayload(testCase.payload, schema);
  
  const passed = (errors.length === 0) === testCase.shouldPass;
  
  if (passed) {
    passedTests++;
  } else {
    console.error(`❌ FAIL: [${endpointName}] - ${testCase.name}`);
    console.error(`   Payload: ${JSON.stringify(testCase.payload)}`);
    console.error(`   Expected: ${testCase.shouldPass ? "PASS" : "FAIL"}`);
    console.error(`   Actual: ${errors.length === 0 ? "PASS" : "FAIL (Errors: " + JSON.stringify(errors) + ")"}`);
  }
}

for (const endpoint of endpoints) {
  console.log(`\nAuditing & Testing Endpoint: [${endpoint.name}]`);
  
  // 1. Valid payload
  let validPayload: any = {};
  if (endpoint.name === "POST /api/projects") {
    validPayload = {
      ownerName: "Alice Smith",
      businessName: "Alice Designs",
      email: "alice@example.com",
      whatsapp: "+91 9876543210",
      packageId: "growth",
      ownership: "rent",
      industry: "Design",
      customIndustry: "",
      goal: "Get leads",
      customGoal: "",
      hasDomain: "yes",
      hasLogo: "no",
      contentReady: "help",
      userId: "user-12345"
    };
  } else if (endpoint.name === "GET /api/projects") {
    validPayload = {
      userId: "user-12345",
      email: "alice@example.com"
    };
  } else if (endpoint.name.includes("/auth/")) {
    validPayload = {
      email: "test@example.com",
      password: "securepassword123"
    };
  } else if (endpoint.name === "PUT /api/projects/:id") {
    validPayload = {
      ownerName: "Updated Name",
      status: "in_progress",
      portalAccess: true
    };
  } else if (endpoint.name === "POST /api/projects/:id/quote") {
    validPayload = {
      packageName: "Catalyst Plan",
      price: 49999,
      discount: 5000,
      features: ["Custom branding", "CMS integration"],
      summary: "High quality custom application"
    };
  } else if (endpoint.name === "POST /api/projects/:id/razorpay-order") {
    validPayload = {
      term: "milestone"
    };
  } else if (endpoint.name === "POST /api/projects/:id/verify-payment") {
    validPayload = {
      razorpay_order_id: "order_Kz9H8J2m",
      razorpay_payment_id: "pay_Hz9K8L1m",
      razorpay_signature: "a5f839c4d9e03d9284cf",
      term: "upfront"
    };
  } else if (endpoint.name === "POST /api/projects/:id/upload") {
    validPayload = {
      name: "logo.png",
      type: "image/png",
      size: 1024,
      content: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    };
  } else if (endpoint.name === "POST /api/admin/verify") {
    validPayload = {
      password: "some-password"
    };
  } else if (endpoint.name === "POST /api/recommendation") {
    validPayload = {
      businessName: "Clinic Inc",
      ownerName: "Dr. John",
      targetAudience: "Patients",
      businessPainPoint: "Booking errors",
      uniqueAdvantage: "Fast care",
      brandTone: "professional",
      brandColors: "Blue",
      needsBooking: true,
      needsReviews: false,
      needsPortfolioGrid: true,
      needsProducts: false
    };
  } else if (endpoint.name === "POST /api/start-project/package-upgrade-options") {
    validPayload = {
      packageId: "foundation",
      businessName: "Micro Business",
      ownerName: "Jack",
      industry: "Retail",
      goal: "Landing page",
      aiPrompt: "Make it modern"
    };
  }

  const testCases: TestCase[] = [
    { name: "✓ Valid Payload", payload: { ...validPayload }, shouldPass: true }
  ];

  // For write endpoints with required fields, test missing required fields
  if (endpoint.name === "POST /api/projects") {
    testCases.push({
      name: "✗ Missing required fields (ownerName)",
      payload: { ...validPayload, ownerName: undefined },
      shouldPass: false
    });
    testCases.push({
      name: "✗ Wrong types (whatsapp as number)",
      payload: { ...validPayload, whatsapp: 9876543210 },
      shouldPass: false
    });
    testCases.push({
      name: "✗ Empty values (email as empty)",
      payload: { ...validPayload, email: "" },
      shouldPass: false
    });
    testCases.push({
      name: "✗ Extremely long strings (ownerName > 200)",
      payload: { ...validPayload, ownerName: "A".repeat(201) },
      shouldPass: false
    });
    testCases.push({
      name: "✗ Invalid emails",
      payload: { ...validPayload, email: "invalid-email" },
      shouldPass: false
    });
    testCases.push({
      name: "✗ Invalid phone numbers",
      payload: { ...validPayload, whatsapp: "not-a-phone" },
      shouldPass: false
    });
    testCases.push({
      name: "✗ Unknown properties",
      payload: { ...validPayload, hacker: "malicious" },
      shouldPass: false
    });
    testCases.push({
      name: "✗ Prototype pollution",
      payload: JSON.parse('{"ownerName":"Alice Smith","businessName":"Alice Designs","email":"alice@example.com","whatsapp":"+91 9876543210","__proto__":{"admin":true}}'),
      shouldPass: false
    });
    testCases.push({
      name: "✗ SQL Injection",
      payload: { ...validPayload, ownerName: "' OR '1'='1" },
      shouldPass: false
    });
    testCases.push({
      name: "✗ XSS payloads",
      payload: { ...validPayload, businessName: "<script>alert(1)</script>" },
      shouldPass: false
    });
  } else if (endpoint.name.includes("/auth/")) {
    testCases.push({
      name: "✗ Missing required fields (password)",
      payload: { ...validPayload, password: undefined },
      shouldPass: false
    });
    testCases.push({
      name: "✗ Wrong types (email as boolean)",
      payload: { ...validPayload, email: true },
      shouldPass: false
    });
    testCases.push({
      name: "✗ Invalid emails",
      payload: { ...validPayload, email: "john@@example.com" },
      shouldPass: false
    });
    testCases.push({
      name: "✗ Password too short",
      payload: { ...validPayload, password: "123" },
      shouldPass: false
    });
    testCases.push({
      name: "✗ SQL Injection inside email",
      payload: { ...validPayload, email: "hacker@example.com' OR '1'='1" },
      shouldPass: false
    });
  } else if (endpoint.name === "POST /api/projects/:id/quote") {
    testCases.push({
      name: "✗ Wrong types (price as string)",
      payload: { ...validPayload, price: "forty-thousand" },
      shouldPass: false
    });
    testCases.push({
      name: "✗ Wrong array items type (features with number)",
      payload: { ...validPayload, features: ["clean designs", 12345] },
      shouldPass: false
    });
    testCases.push({
      name: "✗ Array too large",
      payload: { ...validPayload, features: Array(51).fill("feat") },
      shouldPass: false
    });
  } else if (endpoint.name === "POST /api/projects/:id/razorpay-order") {
    testCases.push({
      name: "✗ Allowed values check (term value must be upfront or milestone)",
      payload: { term: "invalid-term" },
      shouldPass: false
    });
  } else if (endpoint.name === "POST /api/projects/:id/verify-payment") {
    testCases.push({
      name: "✗ Missing field (razorpay_signature)",
      payload: { ...validPayload, razorpay_signature: undefined },
      shouldPass: false
    });
  } else if (endpoint.name === "POST /api/projects/:id/upload") {
    testCases.push({
      name: "✗ Invalid base64 content",
      payload: { ...validPayload, content: "not-base64-!!!" },
      shouldPass: false
    });
  } else if (endpoint.name === "POST /api/admin/verify") {
    testCases.push({
      name: "✗ Missing password",
      payload: {},
      shouldPass: false
    });
  } else if (endpoint.name === "POST /api/recommendation") {
    testCases.push({
      name: "✗ Wrong type (needsBooking as string)",
      payload: { ...validPayload, needsBooking: "yes" },
      shouldPass: false
    });
  } else if (endpoint.name === "POST /api/start-project/package-upgrade-options") {
    testCases.push({
      name: "✗ Invalid packageId value",
      payload: { ...validPayload, packageId: "enterprise-gold" },
      shouldPass: false
    });
  }

  // Run all test cases for this endpoint
  for (const tc of testCases) {
    runTestCase(endpoint.name, endpoint.schema, tc);
  }
}

console.log("\n=====================================================");
console.log(`TEST RESULTS SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log("=====================================================");

if (passedTests === totalTests) {
  console.log("🟢 ALL VALIDATION TESTS PASSED!");
  process.exit(0);
} else {
  console.error("🔴 SOME TESTS FAILED!");
  process.exit(1);
}
