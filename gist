# Apikey : zelapi-fap24r5

#bahan bahannya :
Endpoint :
curl -X POST "https://zelapi.eu.cc/api/v1/premium/send" \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer zelapi-fap24r5" \
   -d '{ "email": "target@gmail.com" }'

Responnya :
{
  "status": true,
  "email": "target@gmail.com",
  "message": "Link verifikasi terkirim...",
  "instructions": [
    "Open your email inbox (check the Spam folder too).",
    "Cari email dari Alight Motion / Alight Creative.",
    "Press and hold the login button, then choose Copy URL.",
    "Don’t tap it directly — just copy the link.",
    "POST /api/v1/premium/verif with body { email, link }."
  ]
}

Endpoint kedua :
curl -X POST "https://zelapi.eu.cc/api/v1/premium/verif" \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer zelapi-fap24r5" \
   -d '{
     "email": "target@gmail.com",
     "link": "https://alightcreative.com/auth/..."
   }'

Responnya :
{
  "status": true,
  "email": "target@gmail.com",
  "premium": true,
  "duration": "1 Tahun",
  "raw_duration": "1_year",
  "message": "The Alight Motion account is already Premium. Log in directly in the app."
}