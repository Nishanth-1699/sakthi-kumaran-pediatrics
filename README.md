# Sakthi Kumaran Pediatrics & Neonatal Care Hospital

Website for Sakthi Kumaran Pediatrics & Neonatal Care Hospital, Pattukkottai, Tamil Nadu, led by Dr. Raja Ramalingam V, MD (Paed), Fellowship in Neonatology. Established 2015.

A single responsive page with no build step and no dependencies apart from Google Fonts.

## Sections
- **Home**: doctor introduction, live open/closed status in India time, key facts
- **Services**: NICU, jaundice phototherapy, vaccinations, growth and development, fever and infections, in-patient ward
- **Doctors**: qualifications, career timeline, photos from inside the hospital
- **Parent resources**: vaccine planner (IAP schedule), fever warning signs, developmental milestones
- **Contact**: weekly hours chart, address and map link, appointment request form

## Run locally
Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Deploy with GitHub Pages
Settings → Pages → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)`.

## Appointment form
The form was first built to save requests through Claude's artifact storage, which only works inside Claude. On any other host, **Send request** asks parents to use **Send on WhatsApp** (which pre-fills a message to +91 87544 42145) or to call. To store requests on this site, connect the form to a backend such as Formspree, Firebase or Google Sheets.

## Before going public
- Get the clinic's approval for all photos. The waiting-area photo shows families' faces.
- Have the doctor review the vaccine schedule and fever guidance.
- Confirm the address spelling: Google lists "Mainckam Colony"; the site uses "Manickam Colony".

## Structure
```
index.html
assets/images/   clinic photos and doctor portrait
```
