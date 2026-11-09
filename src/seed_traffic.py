# src/seed_traffic.py
import random
import requests

# Your local FastAPI endpoint
API_URL = "http://127.0.0.1:8000/log-session"

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
visitor_types = ["New_Visitor", "Returning_Visitor"]

def generate_mock_session(persona_type):
    if persona_type == "buyer":
        # High engagement, product-focused, high page value
        admin = random.randint(0, 2)
        admin_dur = random.uniform(5.0, 30.0)
        info = random.randint(1, 4)
        info_dur = random.uniform(10.0, 60.0)
        product = random.randint(5, 15)
        product_dur = random.uniform(120.0, 600.0)
        page_values = random.uniform(20.0, 80.0)
        actual_revenue = True
        visitor_type = "Returning_Visitor"

    elif persona_type == "window_shopper":
        # Moderate browsing, high product duration, no purchase
        admin = random.randint(0, 1)
        admin_dur = random.uniform(0.0, 20.0)
        info = random.randint(2, 6)
        info_dur = random.uniform(30.0, 120.0)
        product = random.randint(3, 10)
        product_dur = random.uniform(90.0, 400.0)
        page_values = 0.0
        actual_revenue = False
        visitor_type = random.choice(visitor_types)

    else:  # rapid_bouncer
        # Low engagement, quick exit
        admin = 0
        admin_dur = 0.0
        info = random.randint(1, 2)
        info_dur = random.uniform(2.0, 15.0)
        product = random.randint(0, 1)
        product_dur = random.uniform(1.0, 10.0)
        page_values = 0.0
        actual_revenue = False
        visitor_type = "New_Visitor"

    return {
        "Administrative": admin,
        "Administrative_Duration": round(admin_dur, 2),
        "Informational": info,
        "Informational_Duration": round(info_dur, 2),
        "ProductRelated": product,
        "ProductRelated_Duration": round(product_dur, 2),
        "BounceRates": round(random.uniform(0.01, 0.2), 4),
        "ExitRates": round(random.uniform(0.02, 0.25), 4),
        "PageValues": round(page_values, 2),
        "SpecialDay": 0.0,
        "Month": random.choice(months),
        "OperatingSystems": random.randint(1, 4),
        "Browser": random.randint(1, 5),
        "Region": random.randint(1, 9),
        "TrafficType": random.randint(1, 5),
        "VisitorType": visitor_type,
        "Weekend": random.choice([True, False]),
        "actual_revenue": actual_revenue
    }

def run_simulation(total_sessions=25):
    print(f"🚀 Starting simulation: Generating {total_sessions} mock user sessions...")
    
    personas = ["buyer", "window_shopper", "rapid_bouncer"]
    # Weighted distribution: 30% buyers, 50% window shoppers, 20% bouncers
    weights = [0.3, 0.5, 0.2]

    success_count = 0
    for i in range(total_sessions):
        persona = random.choices(personas, weights=weights, k=1)[0]
        payload = generate_mock_session(persona)

        try:
            response = requests.post(API_URL, json=payload)
            if response.status_code == 200:
                success_count += 1
                print(f"[{i+1}/{total_sessions}] Sent {persona.upper()} session -> Status 200 OK")
            else:
                print(f"[{i+1}/{total_sessions}] Failed -> Status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[{i+1}/{total_sessions}] Connection error: {e}")

    print(f"\n✨ Simulation complete! Successfully logged {success_count}/{total_sessions} sessions to Supabase.")

if __name__ == "__main__":
    run_simulation(30)