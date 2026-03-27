import requests
import sys
import json
from datetime import datetime

class WeddingAPITester:
    def __init__(self, base_url="https://shubh-vivah-invite.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            print(f"Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    print("Response: (Non-JSON response)")
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error Response: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"Error Response: {response.text}")
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test(
            "API Root",
            "GET",
            "api/",
            200
        )

    def test_create_rsvp(self):
        """Test RSVP creation"""
        test_rsvp_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": "test@example.com",
            "phone": "+91 9876543210",
            "guests": "2",
            "message": "Looking forward to the celebration!"
        }
        
        success, response = self.run_test(
            "Create RSVP",
            "POST",
            "api/rsvp",
            200,
            data=test_rsvp_data
        )
        
        if success and response:
            # Validate response structure
            required_fields = ['id', 'name', 'email', 'phone', 'guests', 'message', 'timestamp']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Warning: Missing fields in response: {missing_fields}")
            else:
                print("✅ RSVP response structure is valid")
            
            return response.get('id')
        return None

    def test_get_all_rsvps(self):
        """Test getting all RSVPs"""
        success, response = self.run_test(
            "Get All RSVPs",
            "GET",
            "api/rsvps",
            200
        )
        
        if success and response:
            if 'rsvps' in response and 'total' in response:
                print(f"✅ Found {response['total']} RSVP entries")
                return True
            else:
                print("⚠️  Warning: Response missing 'rsvps' or 'total' fields")
        return False

    def test_rsvp_validation(self):
        """Test RSVP validation with invalid data"""
        invalid_data = {
            "name": "",  # Empty name
            "email": "invalid-email",  # Invalid email
            "phone": "",  # Empty phone
            "guests": "10",  # Valid guests
            "message": "Test message"
        }
        
        success, response = self.run_test(
            "RSVP Validation (Invalid Data)",
            "POST",
            "api/rsvp",
            422,  # Expecting validation error
            data=invalid_data
        )
        
        return success

def main():
    print("🎉 Starting Wedding Website API Tests")
    print("=" * 50)
    
    # Setup
    tester = WeddingAPITester()
    
    # Test API availability
    print("\n📡 Testing API Connectivity...")
    api_available, _ = tester.test_api_root()
    
    if not api_available:
        print("❌ API is not accessible. Stopping tests.")
        print(f"\n📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
        return 1
    
    # Test RSVP functionality
    print("\n💌 Testing RSVP Functionality...")
    
    # Test valid RSVP creation
    rsvp_id = tester.test_create_rsvp()
    if not rsvp_id:
        print("❌ RSVP creation failed")
    
    # Test getting all RSVPs
    tester.test_get_all_rsvps()
    
    # Test RSVP validation
    tester.test_rsvp_validation()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())