#!/bin/sh
set -e

# Login
LOGIN_RESP=$(curl -sS -X POST http://localhost:8000/api/auth/login -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"email":"admin@admin.com","password":"123456"}')
printf "LOGIN_RAW:%s\n" "$LOGIN_RESP"
ACCESS_TOKEN=$(printf "%s" "$LOGIN_RESP" | php -r "echo json_decode(stream_get_contents(STDIN))->access_token ?? '';")
if [ -z "$ACCESS_TOKEN" ]; then
  printf "ERROR: no access_token returned\n"
  exit 1
fi
printf "LOGIN_OK token_len=%s\n" "${#ACCESS_TOKEN}"

run_get(){
  URL=$1
  NAME=$2
  # Use consistent curl format and headers
  RESP=$(curl -sS -w "$HTTP_CODE_FMT" -H "Authorization: Bearer $ACCESS_TOKEN" -H "$ACCEPT_HDR" "$URL")
  HTTP=$(printf "%s" "$RESP" | tail -n1)
  BODY=$(printf "%s" "$RESP" | sed '$d')
  printf "[%s] %s\n%s\n---\n" "$NAME" "$HTTP" "$(printf "%s" "$BODY" | head -c 1200)"
}

run_get "http://localhost:8000/api/properties" "properties"
run_get "http://localhost:8000/api/room-categories" "room-categories"
run_get "http://localhost:8000/api/rooms" "rooms"
run_get "http://localhost:8000/api/partners" "partners"
run_get "http://localhost:8000/api/invoices" "invoices"

HTTP_CODE_FMT="\n%{http_code}"
ACCEPT_HDR='Accept: application/json'
CONTENT_TYPE='Content-Type: application/json'

FIRST_PARTNER_ID=$(curl -sS -H "Authorization: Bearer $ACCESS_TOKEN" -H "$ACCEPT_HDR" http://localhost:8000/api/partners | php -r '$s=stream_get_contents(STDIN); $d=json_decode($s,true); if(!$d) exit; if(isset($d["data"][0]["id"])) echo $d["data"][0]["id"]; elseif(isset($d[0]["id"])) echo $d[0]["id"];')
printf "FIRST_PARTNER_ID=%s\n" "$FIRST_PARTNER_ID"

# If there are no partners, create one so we can create an invoice
if [ -z "$FIRST_PARTNER_ID" ]; then
  printf "No partners found, creating a partner...\n"
  CREATE_PARTNER=$(curl -sS -w "$HTTP_CODE_FMT" -H "Authorization: Bearer $ACCESS_TOKEN" -H "$ACCEPT_HDR" -H "$CONTENT_TYPE" -X POST http://localhost:8000/api/partners -d '{"name":"Auto Partner"}')
  P_HTTP=$(printf "%s" "$CREATE_PARTNER" | tail -n1)
  P_BODY=$(printf "%s" "$CREATE_PARTNER" | sed '$d')
  printf "[create-partner] %s\n%s\n---\n" "$P_HTTP" "$(printf "%s" "$P_BODY" | head -c 800)"
  FIRST_PARTNER_ID=$(printf "%s" "$P_BODY" | php -r 'echo json_decode(stream_get_contents(STDIN), true)["id"] ?? "";')
  printf "FIRST_PARTNER_ID=%s\n" "$FIRST_PARTNER_ID"
fi

if [ -n "$FIRST_PARTNER_ID" ]; then
  CREATE_RESP=$(curl -sS -w "$HTTP_CODE_FMT" -H "Authorization: Bearer $ACCESS_TOKEN" -H "$ACCEPT_HDR" -H "$CONTENT_TYPE" -X POST http://localhost:8000/api/invoices -d "{\"partner_id\": \"$FIRST_PARTNER_ID\", \"lines\": [{\"description\": \"Auto invoice\", \"quantity\":1, \"unit_price\": 10.0}]}" )
  HTTP=$(printf "%s" "$CREATE_RESP" | tail -n1)
  BODY=$(printf "%s" "$CREATE_RESP" | sed '$d')
  printf "[create-invoice] %s\n%s\n---\n" "$HTTP" "$(printf "%s" "$BODY" | head -c 2000)"
  INVOICE_ID=$(printf "%s" "$BODY" | php -r '$s=stream_get_contents(STDIN); $d=json_decode($s,true); echo $d["data"]["id"] ?? $d["id"] ?? "";')
  printf "INVOICE_ID=%s\n" "$INVOICE_ID"
  if [ -n "$INVOICE_ID" ]; then
    PAY_RESP=$(curl -sS -w "$HTTP_CODE_FMT" -H "Authorization: Bearer $ACCESS_TOKEN" -H "$ACCEPT_HDR" -H "$CONTENT_TYPE" -X POST http://localhost:8000/api/invoices/$INVOICE_ID/payments -d "{\"invoice_id\": \"$INVOICE_ID\", \"amount\":10.0, \"method\":\"card\"}")
    P_HTTP=$(printf "%s" "$PAY_RESP" | tail -n1)
    P_BODY=$(printf "%s" "$PAY_RESP" | sed '$d')
    printf "[create-payment] %s\n%s\n---\n" "$P_HTTP" "$(printf "%s" "$P_BODY" | head -c 2000)"
  fi
else
  printf "no partner id found, skipping invoice creation\n"
fi

exit 0
