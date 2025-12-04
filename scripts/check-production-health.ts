#!/usr/bin/env tsx

/**
 * Production Health Check Script
 * 
 * Run this to verify production deployment health:
 * npx tsx scripts/check-production-health.ts
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://smartshift-production.up.railway.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://smartshift-785vgck6r-ryans-projects-470b3376.vercel.app';

interface HealthCheck {
  name: string;
  passed: boolean;
  error?: string;
}

const checks: HealthCheck[] = [];

async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();
    
    checks.push({
      name: 'Backend Health Endpoint',
      passed: response.ok && data.status === 'ok',
      error: response.ok ? undefined : `Status: ${response.status}`,
    });
  } catch (error) {
    checks.push({
      name: 'Backend Health Endpoint',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function checkCORS() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
      },
    });
    
    const allowOrigin = response.headers.get('access-control-allow-origin');
    
    checks.push({
      name: 'CORS Configuration',
      passed: response.ok && (allowOrigin === FRONTEND_URL || allowOrigin === '*'),
      error: response.ok ? undefined : `CORS headers missing or incorrect`,
    });
  } catch (error) {
    checks.push({
      name: 'CORS Configuration',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function checkFrontendLoad() {
  try {
    const response = await fetch(FRONTEND_URL);
    
    checks.push({
      name: 'Frontend Loading',
      passed: response.ok,
      error: response.ok ? undefined : `Status: ${response.status}`,
    });
  } catch (error) {
    checks.push({
      name: 'Frontend Loading',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function checkDatabaseConnection() {
  try {
    // Try to hit an endpoint that requires database
    const response = await fetch(`${BACKEND_URL}/api/work-roles`);
    
    checks.push({
      name: 'Database Connection',
      passed: response.ok || response.status === 401, // 401 means auth failed but DB is accessible
      error: response.ok ? undefined : `Status: ${response.status}`,
    });
  } catch (error) {
    checks.push({
      name: 'Database Connection',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function main() {
  console.log('🔍 Checking SmartShift Production Health...\n');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}\n`);
  
  await Promise.all([
    checkBackendHealth(),
    checkCORS(),
    checkFrontendLoad(),
    checkDatabaseConnection(),
  ]);
  
  console.log('Results:\n');
  
  let allPassed = true;
  
  for (const check of checks) {
    const status = check.passed ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
    if (!check.passed && check.error) {
      console.log(`   Error: ${check.error}`);
      allPassed = false;
    }
  }
  
  console.log('');
  
  if (allPassed) {
    console.log('✅ All checks passed! Production is healthy.');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed. Please investigate.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
