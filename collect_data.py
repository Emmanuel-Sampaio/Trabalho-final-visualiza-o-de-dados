import requests
import pandas as pd
import json
from datetime import datetime, timedelta
import time
import random
import math
import os

CITIES = [
    # Ásia (15 cidades)
    {"name": "Delhi", "country": "IN", "lat": 28.7041, "lon": 77.1025, "continent": "Asia"},
    {"name": "Beijing", "country": "CN", "lat": 39.9042, "lon": 116.4074, "continent": "Asia"},
    {"name": "Tokyo", "country": "JP", "lat": 35.6762, "lon": 139.6503, "continent": "Asia"},
    {"name": "Seoul", "country": "KR", "lat": 37.5665, "lon": 126.9780, "continent": "Asia"},
    {"name": "Mumbai", "country": "IN", "lat": 19.0760, "lon": 72.8777, "continent": "Asia"},
    {"name": "Shanghai", "country": "CN", "lat": 31.2304, "lon": 121.4737, "continent": "Asia"},
    {"name": "Bangkok", "country": "TH", "lat": 13.7563, "lon": 100.5018, "continent": "Asia"},
    {"name": "Jakarta", "country": "ID", "lat": -6.2088, "lon": 106.8456, "continent": "Asia"},
    {"name": "Hong Kong", "country": "HK", "lat": 22.3193, "lon": 114.1694, "continent": "Asia"},
    {"name": "Singapore", "country": "SG", "lat": 1.3521, "lon": 103.8198, "continent": "Asia"},
    {"name": "Kolkata", "country": "IN", "lat": 22.5726, "lon": 88.3639, "continent": "Asia"},
    {"name": "Dubai", "country": "AE", "lat": 25.2048, "lon": 55.2708, "continent": "Asia"},
    {"name": "Riyadh", "country": "SA", "lat": 24.7136, "lon": 46.6753, "continent": "Asia"},
    {"name": "Hanoi", "country": "VN", "lat": 21.0285, "lon": 105.8542, "continent": "Asia"},
    {"name": "Lahore", "country": "PK", "lat": 31.5204, "lon": 74.3587, "continent": "Asia"},
    
    # Europa (8 cidades)
    {"name": "London", "country": "GB", "lat": 51.5074, "lon": -0.1278, "continent": "Europe"},
    {"name": "Paris", "country": "FR", "lat": 48.8566, "lon": 2.3522, "continent": "Europe"},
    {"name": "Berlin", "country": "DE", "lat": 52.5200, "lon": 13.4050, "continent": "Europe"},
    {"name": "Madrid", "country": "ES", "lat": 40.4168, "lon": -3.7038, "continent": "Europe"},
    {"name": "Rome", "country": "IT", "lat": 41.9028, "lon": 12.4964, "continent": "Europe"},
    {"name": "Moscow", "country": "RU", "lat": 55.7558, "lon": 37.6173, "continent": "Europe"},
    {"name": "Amsterdam", "country": "NL", "lat": 52.3676, "lon": 4.9041, "continent": "Europe"},
    {"name": "Warsaw", "country": "PL", "lat": 52.2297, "lon": 21.0122, "continent": "Europe"},
    
    # América do Norte (5 cidades)
    {"name": "New York", "country": "US", "lat": 40.7128, "lon": -74.0060, "continent": "North America"},
    {"name": "Los Angeles", "country": "US", "lat": 34.0522, "lon": -118.2437, "continent": "North America"},
    {"name": "Mexico City", "country": "MX", "lat": 19.4326, "lon": -99.1332, "continent": "North America"},
    {"name": "Chicago", "country": "US", "lat": 41.8781, "lon": -87.6298, "continent": "North America"},
    {"name": "Toronto", "country": "CA", "lat": 43.6532, "lon": -79.3832, "continent": "North America"},
    
    # América do Sul (6 cidades)
    {"name": "São Paulo", "country": "BR", "lat": -23.5505, "lon": -46.6333, "continent": "South America"},
    {"name": "Rio de Janeiro", "country": "BR", "lat": -22.9068, "lon": -43.1729, "continent": "South America"},
    {"name": "Buenos Aires", "country": "AR", "lat": -34.6037, "lon": -58.3816, "continent": "South America"},
    {"name": "Fortaleza", "country": "BR", "lat": -3.7172, "lon": -38.5433, "continent": "South America"},
    {"name": "Santiago", "country": "CL", "lat": -33.4489, "lon": -70.6693, "continent": "South America"},
    {"name": "Bogotá", "country": "CO", "lat": 4.7110, "lon": -74.0721, "continent": "South America"},

    # África (4 cidades)
    {"name": "Cairo", "country": "EG", "lat": 30.0444, "lon": 31.2357, "continent": "Africa"},
    {"name": "Lagos", "country": "NG", "lat": 6.5244, "lon": 3.3792, "continent": "Africa"},
    {"name": "Johannesburg", "country": "ZA", "lat": -26.2041, "lon": 28.0473, "continent": "Africa"},
    {"name": "Nairobi", "country": "KE", "lat": -1.2921, "lon": 36.8219, "continent": "Africa"},
    
    # Oceania (2 cidades)
    {"name": "Sydney", "country": "AU", "lat": -33.8688, "lon": 151.2093, "continent": "Oceania"},
    {"name": "Melbourne", "country": "AU", "lat": -37.8136, "lon": 144.9631, "continent": "Oceania"},
]

def generate_synthetic_data():
    all_data = []
    end_date = datetime(2025, 12, 31)
    start_date = datetime(2023, 1, 1)

    pollution_base = {
        # Ásia
        "Delhi": {"pm25": 110, "pm10": 200, "no2": 55, "o3": 45, "so2": 15, "variability": 40},
        "Beijing": {"pm25": 85, "pm10": 150, "no2": 50, "o3": 40, "so2": 20, "variability": 35},
        "Kolkata": {"pm25": 95, "pm10": 185, "no2": 50, "o3": 43, "so2": 13, "variability": 35},
        "Mumbai": {"pm25": 75, "pm10": 140, "no2": 48, "o3": 42, "so2": 12, "variability": 28},
        "Shanghai": {"pm25": 70, "pm10": 130, "no2": 52, "o3": 38, "so2": 18, "variability": 30},
        "Jakarta": {"pm25": 60, "pm10": 110, "no2": 44, "o3": 48, "so2": 11, "variability": 25},
        "Bangkok": {"pm25": 55, "pm10": 105, "no2": 42, "o3": 50, "so2": 10, "variability": 24},
        "Seoul": {"pm25": 40, "pm10": 75, "no2": 35, "o3": 42, "so2": 9, "variability": 18},
        "Hong Kong": {"pm25": 35, "pm10": 65, "no2": 40, "o3": 44, "so2": 8, "variability": 16},
        "Tokyo": {"pm25": 25, "pm10": 45, "no2": 28, "o3": 40, "so2": 4, "variability": 10},
        "Singapore": {"pm25": 22, "pm10": 42, "no2": 30, "o3": 45, "so2": 5, "variability": 12},
        "Dubai": {"pm25": 45, "pm10": 130, "no2": 38, "o3": 60, "so2": 12, "variability": 25},
        "Riyadh": {"pm25": 50, "pm10": 150, "no2": 35, "o3": 58, "so2": 10, "variability": 30},
        "Hanoi": {"pm25": 65, "pm10": 110, "no2": 40, "o3": 45, "so2": 14, "variability": 28},
        "Lahore": {"pm25": 120, "pm10": 210, "no2": 50, "o3": 40, "so2": 18, "variability": 45},
        
        # Europa
        "Moscow": {"pm25": 35, "pm10": 68, "no2": 38, "o3": 42, "so2": 7, "variability": 18},
        "Warsaw": {"pm25": 30, "pm10": 58, "no2": 34, "o3": 44, "so2": 6, "variability": 15},
        "Rome": {"pm25": 26, "pm10": 48, "no2": 36, "o3": 50, "so2": 5, "variability": 13},
        "Madrid": {"pm25": 24, "pm10": 45, "no2": 34, "o3": 52, "so2": 4, "variability": 12},
        "London": {"pm25": 22, "pm10": 40, "no2": 35, "o3": 45, "so2": 5, "variability": 10},
        "Paris": {"pm25": 20, "pm10": 38, "no2": 32, "o3": 42, "so2": 4, "variability": 9},
        "Berlin": {"pm25": 18, "pm10": 35, "no2": 28, "o3": 40, "so2": 3, "variability": 8},
        "Amsterdam": {"pm25": 17, "pm10": 33, "no2": 30, "o3": 43, "so2": 3, "variability": 8},
        
        # América do Norte
        "Mexico City": {"pm25": 55, "pm10": 100, "no2": 42, "o3": 55, "so2": 14, "variability": 22},
        "Los Angeles": {"pm25": 35, "pm10": 65, "no2": 32, "o3": 65, "so2": 5, "variability": 15},
        "Chicago": {"pm25": 30, "pm10": 55, "no2": 32, "o3": 50, "so2": 7, "variability": 14},
        "New York": {"pm25": 28, "pm10": 50, "no2": 30, "o3": 48, "so2": 6, "variability": 12},
        "Toronto": {"pm25": 20, "pm10": 38, "no2": 28, "o3": 46, "so2": 4, "variability": 10},
        
        # América do Sul
        "São Paulo": {"pm25": 45, "pm10": 80, "no2": 38, "o3": 45, "so2": 8, "variability": 20},
        "Buenos Aires": {"pm25": 38, "pm10": 70, "no2": 36, "o3": 48, "so2": 7, "variability": 17},
        "Rio de Janeiro": {"pm25": 35, "pm10": 65, "no2": 34, "o3": 50, "so2": 6, "variability": 16},
        "Fortaleza": {"pm25": 28, "pm10": 52, "no2": 30, "o3": 55, "so2": 5, "variability": 14},
        "Santiago": {"pm25": 28, "pm10": 60, "no2": 45, "o3": 42, "so2": 6, "variability": 22},
        "Bogotá": {"pm25": 22, "pm10": 45, "no2": 32, "o3": 38, "so2": 5, "variability": 15},
        
        # África
        "Cairo": {"pm25": 95, "pm10": 180, "no2": 45, "o3": 50, "so2": 18, "variability": 30},
        "Lagos": {"pm25": 65, "pm10": 120, "no2": 40, "o3": 48, "so2": 10, "variability": 25},
        "Johannesburg": {"pm25": 30, "pm10": 65, "no2": 34, "o3": 44, "so2": 12, "variability": 20},
        "Nairobi": {"pm25": 25, "pm10": 50, "no2": 28, "o3": 40, "so2": 6, "variability": 15},
        
        # Oceania
        "Sydney": {"pm25": 15, "pm10": 30, "no2": 25, "o3": 50, "so2": 3, "variability": 7},
        "Melbourne": {"pm25": 12, "pm10": 25, "no2": 20, "o3": 45, "so2": 2, "variability": 6},
    }

    current_date = start_date
    while current_date <= end_date:
        for city in CITIES:
            city_name = city["name"]
            if city_name not in pollution_base:
                continue

            base = pollution_base[city_name]
            month = current_date.month
            seasonal_factor = 1.0

            if month in [12, 1, 2]:
                seasonal_factor = 1.3 if city["continent"] in ["Europe", "Asia", "North America"] else 0.85
            elif month in [6, 7, 8]:
                seasonal_factor = 0.85 if city["continent"] in ["Europe", "Asia", "North America"] else 1.2

            daily_var = random.gauss(0, base["variability"])
            pm25 = max(5, base["pm25"] * seasonal_factor + daily_var)
            pm10 = max(10, base["pm10"] * seasonal_factor + daily_var * 1.5)
            no2 = max(5, base["no2"] * seasonal_factor + daily_var * 0.5)
            o3 = max(10, base["o3"] + daily_var * 0.3)
            so2 = max(1, base["so2"] * seasonal_factor + daily_var * 0.2)

            if pm25 <= 12:
                aqi = pm25 * 4.17
            elif pm25 <= 35.4:
                aqi = 50 + (pm25 - 12) * 2.14
            elif pm25 <= 55.4:
                aqi = 100 + (pm25 - 35.4) * 2.5
            elif pm25 <= 150.4:
                aqi = 150 + (pm25 - 55.4) * 1.05
            else:
                aqi = 200 + (pm25 - 150.4) * 1.05

            all_data.append({
                "city": city_name,
                "country": city["country"],
                "continent": city["continent"],
                "latitude": city["lat"],
                "longitude": city["lon"],
                "date": current_date.strftime("%Y-%m-%d"),
                "pm25": round(pm25, 2),
                "pm10": round(pm10, 2),
                "no2": round(no2, 2),
                "o3": round(o3, 2),
                "so2": round(so2, 2),
                "aqi": round(aqi, 1)
            })
        current_date += timedelta(days=1)

    return pd.DataFrame(all_data)

def main():
    if not os.path.exists('data'):
        os.makedirs('data')

    df = generate_synthetic_data()

    df.to_csv("data/air_quality_raw.csv", index=False)

    df['date_dt'] = pd.to_datetime(df['date'])
    df['year'] = df['date_dt'].dt.year
    df['month'] = df['date_dt'].dt.month
    df['year_month'] = df['date_dt'].dt.to_period('M').astype(str)

    annual_avg = df.groupby(
        ['city', 'country', 'continent', 'latitude', 'longitude', 'year']
    ).agg({
        'pm25': 'mean',
        'pm10': 'mean',
        'no2': 'mean',
        'o3': 'mean',
        'so2': 'mean',
        'aqi': 'mean'
    }).round(2).reset_index()

    annual_avg.to_csv("data/annual_averages.csv", index=False)

    monthly_avg = df.groupby(
        ['city', 'country', 'continent', 'year_month', 'month']
    ).agg({
        'pm25': 'mean',
        'pm10': 'mean',
        'no2': 'mean',
        'o3': 'mean',
        'so2': 'mean',
        'aqi': 'mean'
    }).round(2).reset_index()

    monthly_avg.to_csv("data/monthly_averages.csv", index=False)

    map_data = df.groupby(
        ['city', 'country', 'continent', 'latitude', 'longitude']
    ).agg({
        'pm25': 'mean',
        'pm10': 'mean',
        'no2': 'mean',
        'o3': 'mean',
        'so2': 'mean',
        'aqi': 'mean'
    }).round(2).reset_index()

    map_data.to_json("data/map_data.json", orient="records", indent=2)

if __name__ == "__main__":
    main()
