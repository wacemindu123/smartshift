/**
 * Test production backend to diagnose issues
 */

const BACKEND_URL = 'https://smartshift-production.up.railway.app';

async function testBackend() {
  console.log('🔍 Testing production backend...\n');
  
  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const healthRes = await fetch(`${BACKEND_URL}/health`);
    const health = await healthRes.json();
    console.log('✅ Health check passed:', health);
  } catch (error) {
    console.log('❌ Health check failed:', error);
    return;
  }
  
  // Test 2: Database connection (via health or specific endpoint)
  console.log('\n2. Testing database connection...');
  // We can't test this directly without auth, but we can check if API routes respond
  
  // Test 3: Try to access a protected route (should fail with 401, not 500)
  console.log('\n3. Testing protected route (should return 401)...');
  try {
    const userRes = await fetch(`${BACKEND_URL}/api/users/me`);
    console.log('Status:', userRes.status);
    
    if (userRes.status === 401) {
      console.log('✅ Protected route working (correctly returns 401)');
    } else if (userRes.status === 500) {
      const error = await userRes.text();
      console.log('❌ Server error (500):', error);
    } else {
      const data = await userRes.text();
      console.log('Response:', data);
    }
  } catch (error) {
    console.log('❌ Request failed:', error);
  }
  
  console.log('\n📊 Test complete!');
}

testBackend();
