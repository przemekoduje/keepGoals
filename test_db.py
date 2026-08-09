import firebase_admin
from firebase_admin import firestore
import json

if not firebase_admin._apps:
    firebase_admin.initialize_app()
db = firestore.client()

teams = db.collection("teams").limit(1).stream()
for t in teams:
    print("TEAM:", t.id, t.to_dict())

notes = db.collection_group("notes").limit(5).stream()
for n in notes:
    print("NOTE:", n.id, "Pending:", n.to_dict().get("pending_user_ids"), "Assigned:", n.to_dict().get("assigned_user_ids"))
