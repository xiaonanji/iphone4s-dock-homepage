---
name: iphone4-clock-add-notification
description: steps to update iphone4 clock notification. Can be triggered by user requesting to update Terry's clock notification, too.
---

# add-notification

You are helping the user add, update, or remove a notification entry in `notifications.json` for the iphone4s-dock-homepage widget. Follow the steps below in order.

## The user's request

$ARGUMENTS

---

## Step 1 — Understand the intent

From the user's request, extract:

- **text** — the notification message to display. Preserve the original casing exactly.
- **start** — (optional) the start date in `YYYY-MM-DD` format. If the user does not specify a start date, omit the `start` field entirely from the JSON entry (the widget treats a missing start as today).
- **end** — (required) the end date in `YYYY-MM-DD` format. If the user does not provide an end date, ask them to supply one before proceeding — the widget ignores entries without an end date.

If the user says "remove" or "delete" a notification, identify the matching entry by text or date and remove it from the array.

If the user says "clear all" or "remove all", replace the array with `[]`.

Relative date phrases must be converted to absolute `YYYY-MM-DD` dates using today's date as the reference.

---

## Step 2 — Sync with remote

Run the following in the cloned repository directory:

```
cd <FILL_IN_REPO_PATH>
git pull origin main
```

If the pull fails due to conflicts, stop and report the error to the user. Do not proceed.

---

## Step 3 — Read the current notifications

Read the file at:

```
<FILL_IN_REPO_PATH>/notifications.json
```

It is a JSON array. Each entry has the shape:

```json
{
  "text": "string — the displayed message",
  "start": "YYYY-MM-DD — optional, omit if not set",
  "end": "YYYY-MM-DD — required"
}
```

---

## Step 4 — Apply the change

Validation rules before writing:

- `end` is required. If missing, skip the entry.
- If both `start` and `end` are present, `end` must be >= `start`. If not, skip the entry.
- `text` must be a non-empty string.
- Preserve the casing of `text` exactly as provided by the user.
- When adding: append the new entry to the end of the array (last match wins on the widget when dates overlap).
- When removing: filter out the matching entry.

Write the updated array back to `notifications.json`. Keep the formatting clean — 2-space indentation, one entry per object block.

---

## Step 5 — Commit and push

```
cd <FILL_IN_REPO_PATH>
git add notifications.json
git commit -m "notification: <brief description of what was added/removed>"
git push origin main
```

Use a commit message that briefly describes the change, for example:
- `notification: add school term reminder Apr 11–18`
- `notification: remove lunch reminder`
- `notification: clear all notifications`

---

## Step 6 — Confirm to the user

Report back with:
- What was added, updated, or removed.
- The final state of `notifications.json` (print the full array).
- Confirmation that the push succeeded.

If anything failed (pull conflict, validation error, push error), report clearly and do not leave the file in a partial state.
