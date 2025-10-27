#!/usr/bin/env python3
"""
Script per recuperare automaticamente i badge Credly e aggiornare certifications.json
Usa le API pubbliche ufficiali di Credly
"""

import json
import os
import sys
from typing import List, Dict
import requests


def fetch_credly_badges(username: str) -> List[Dict]:
    """
    Recupera i badge dal profilo pubblico Credly usando le API ufficiali
    
    Args:
        username: Username Credly dell'utente
        
    Returns:
        Lista di badge con informazioni
    """
    # API endpoint ufficiale di Credly
    api_url = f"https://www.credly.com/users/{username}/badges.json"
    
    try:
        headers = {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
        }
        
        print(f"🌐 Fetching from: {api_url}")
        response = requests.get(api_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if 'data' not in data:
            print("⚠️  No 'data' field in response", file=sys.stderr)
            return []
        
        badges = []
        
        for badge_data in data['data']:
            try:
                # Estrai informazioni dal badge
                name = badge_data.get('badge_template', {}).get('name', 'Unknown Badge')
                issuer = badge_data.get('badge_template', {}).get('issuer', {}).get('summary', 'Unknown Issuer')
                description = badge_data.get('badge_template', {}).get('description', '')
                
                # Data di emissione
                issued_at = badge_data.get('issued_at', '')
                year = issued_at.split('-')[0] if issued_at else "2025"
                
                # URL immagine badge (usa dimensione grande)
                badge_image_url = badge_data.get('badge_template', {}).get('image_url', '')
                if badge_image_url and '/size/110x110/' in badge_image_url:
                    badge_image_url = badge_image_url.replace('/size/110x110/', '/size/680x680/')
                
                # URL pubblico del badge
                badge_url = badge_data.get('public_url', '')
                if not badge_url:
                    badge_url = f"https://www.credly.com/badges/{badge_data.get('id', '')}"
                
                badge = {
                    "name": name,
                    "issuer": issuer,
                    "date": year,
                    "description": description,
                    "badge_url": badge_image_url,
                    "credential_url": badge_url
                }
                
                badges.append(badge)
                print(f"  ✓ {name} ({year})")
                
            except Exception as e:
                print(f"⚠️  Warning: Error parsing badge: {e}", file=sys.stderr)
                continue
        
        return badges
        
    except requests.RequestException as e:
        print(f"❌ Error fetching Credly profile: {e}", file=sys.stderr)
        return []
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON response: {e}", file=sys.stderr)
        return []


def update_certifications_file(badges: List[Dict], output_path: str = "data/certifications.json"):
    """
    Aggiorna il file certifications.json con i badge recuperati
    
    Args:
        badges: Lista di badge da salvare
        output_path: Path del file JSON da aggiornare
    """
    # Ordina per data (più recenti prima)
    badges_sorted = sorted(badges, key=lambda x: x['date'], reverse=True)
    
    # Salva il file JSON formattato
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(badges_sorted, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Updated {output_path} with {len(badges_sorted)} certifications")


def main():
    """Main function"""
    # Ottieni username da variabile d'ambiente o usa default
    username = os.getenv('CREDLY_USERNAME', 'fabio-zamboni')
    
    print(f"🔍 Fetching badges for Credly user: {username}")
    
    # Recupera i badge
    badges = fetch_credly_badges(username)
    
    if not badges:
        print("⚠️  No badges found or error occurred")
        sys.exit(1)
    
    print(f"📋 Found {len(badges)} badge(s)")
    
    # Aggiorna il file
    update_certifications_file(badges)
    
    print("✨ Done!")


if __name__ == "__main__":
    main()
