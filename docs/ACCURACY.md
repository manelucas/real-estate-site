# Data accuracy report

Generated 2026-11-18 by `npm run verify`.

## Sources

| Dataset | Records | Retrieved |
|---|---:|---|
| [Florida Dept. of Revenue — 2026 Final Name-Address-Legal (NAL) tax roll, Palm Beach County (60)](https://floridarevenue.com/property/dataportal/Documents/PTO%20Data%20Portal/Tax%20Roll%20Data%20Files/NAL/2026F/Palm%20Beach%2060%20Final%20NAL%202026.zip) | 657,468 | 2026-11-18 |
| [Florida Dept. of Revenue — 2026 Final Sale Data File (SDF), Palm Beach County (60)](https://floridarevenue.com/property/dataportal/Documents/PTO%20Data%20Portal/Tax%20Roll%20Data%20Files/SDF/2026F/Palm%20Beach%2060%20Final%20SDF%202026.zip) | 110,606 | 2026-11-18 |
| [Palm Beach County Tax Collector — County-held tax certificates (unpaid delinquent real-estate taxes)](https://www.pbctax.gov/wp-content/uploads/2026/11/County_Certs_PBCTax-11.2.26.xlsx) | 833 | 2026-11-18 |

## 1. Delinquent-tax records matched to parcels

**833 of 833 certificates (100%)** matched a parcel on the Florida DOR certified tax roll by 17-character parcel control number.

## 2. Independent cross-check: legal descriptions

The Tax Collector's certificate file and the state tax roll each carry a legal description. They come from different offices, so agreement confirms the parcel match is correct and not just a coincidence of IDs.

**833 of 833 (100%)** agree (prefix or ≥60% token overlap; the state roll stores a shortened legal description).

## 3. Live check against the Property Appraiser (pbcpao.gov)

A random sample of 20 parcels (half tax-delinquent, half not) was fetched from the Property Appraiser's public site and compared with the database.

- Situs address matches: **20 / 20**
- Owner name matches: **20 / 20**

| Parcel | Database address | pbcpao.gov address | Database owner | pbcpao.gov owner(s) |
|---|---|---|---|---|
| [00-42-44-12-09-001-0112](https://pbcpao.gov/Property/Details?parcelId=00424412090010112) | PRESTON DR | PRESTON DR ✓ | KELLY DOUGLAS W & | KELLY DOUGLAS W & VARNADORE RALPH 3795 PATIO CT # A4 LAKE WORTH BEACH FL 33461 3930 ✓ |
| [41-41-43-17-01-342-0340](https://pbcpao.gov/Property/Details?parcelId=41414317013420340) | PARADISE TRL | PARADISE TRL ✓ | BIDDIX INVESTMENTS INC | BIDDIX INVESTMENTS INC 14198 BIDDIX RD LOXAHATCHEE FL 33470 4631 ✓ |
| [36-43-42-20-09-000-1070](https://pbcpao.gov/Property/Details?parcelId=36434220090001070) | S KILLIAN DR | S KILLIAN DR ✓ | CONGRESS AVENUE PROPERTIES | CONGRESS AVENUE PROPERTIES DIVOSTA INVESTMENTS L L C C/O 3825 PGA BLVD STE 1003 PALM BCH GDNS FL 33410 2991 ✓ |
| [00-38-44-02-00-000-1020](https://pbcpao.gov/Property/Details?parcelId=00384402000001020) | 28900 COUNTY ROAD 880 | 28900 COUNTY ROAD 880 ✓ | DOUBLE D FARMS CANAL POA | DOUBLE D FARMS CANAL POA OFFICE GENERAL COUNSEL C/O 1415 LOUISIANA AVE # 2300 HOUSTON TX 77002 7360 ✓ |
| [00-42-43-27-05-063-0960](https://pbcpao.gov/Property/Details?parcelId=00424327050630960) | 122ND PL S | 122ND PL S ✓ | GAMOT ALBERT J JR | GAMOT ALBERT J JR 6029 180TH ST N JUPITER FL 33458 7916 ✓ |
| [00-42-44-12-09-002-0174](https://pbcpao.gov/Property/Details?parcelId=00424412090020174) | BRENTWOOD CT | BRENTWOOD CT ✓ | ATWATER MARIE A | ATWATER MARIE A 328 PENNINGTON CT ROYAL PALM BEACH FL 33411 1538 ✓ |
| [00-42-47-16-15-000-1653](https://pbcpao.gov/Property/Details?parcelId=00424716150001653) | BURNSIDE CT | BURNSIDE CT ✓ | REGION TRUST INC | REGION TRUST INC 119 N SWINTON AVE DELRAY BEACH FL 33444 2633 ✓ |
| [06-42-47-23-04-013-0050](https://pbcpao.gov/Property/Details?parcelId=06424723040130050) | E CONFERENCE DR | E CONFERENCE DR ✓ | SAUER HAROLD A & | SAUER GERTRUDE E SAUER HAROLD A & 616 E CONFERNCE DR BOCA RATON FL 33486 3151 ✓ |
| [72-41-43-23-22-000-0310](https://pbcpao.gov/Property/Details?parcelId=72414323220000310) | 128 BELLA VITA DR | 128 BELLA VITA DR ✓ | HYSLOPE CHRISTA M & | HYSLOPE CHRISTA M & HYSLOPE JUDY HYSLOPE KENNETH & 128 BELLA VITA DR ROYAL PALM BEACH FL 33411 1227 ✓ |
| [00-42-43-23-17-009-2110](https://pbcpao.gov/Property/Details?parcelId=00424323170092110) | 211 BEDFORD I | 211 BEDFORD I ✓ | SADLER LAURA J | SADLER LAURA J LAURA J SADLER TR TITL HLDR SADLER LAURA J TR 211 BEDFORD I WEST PALM BEACH FL 33417 2235 ✓ |
| [73-42-44-17-02-001-3440](https://pbcpao.gov/Property/Details?parcelId=73424417020013440) | 9146 DELEMAR CT | 9146 DELEMAR CT ✓ | LEIBOVICI JACOB & | ALCALAY LEIBOVICI SHARON LEIBOVICI JACOB & 9146 DELEMAR CT WELLINGTON FL 33414 3420 ✓ |
| [30-42-41-22-03-101-0100](https://pbcpao.gov/Property/Details?parcelId=30424122031010100) | 6117 HEATHER ST | 6117 HEATHER ST ✓ | CORSI DIANE & | CORSI DIANE & CORSI JAMES J 6129 HEATHER ST JUPITER FL 33458 6751 ✓ |
| [00-42-45-17-10-000-2490](https://pbcpao.gov/Property/Details?parcelId=00424517100002490) | 8956 GRAND PRIX LN | 8956 GRAND PRIX LN ✓ | NARDONE CHARLES & | NARDONE CHARLES & PUCCI CARLA 8 PINE DR STONY POINT NY 10980 2500 ✓ |
| [00-42-45-32-06-000-2190](https://pbcpao.gov/Property/Details?parcelId=00424532060002190) | 8173 EMERALD WINDS CIR | 8173 EMERALD WINDS CIR ✓ | SINGER-CORREA SHELLIE | SINGER-CORREA SHELLIE 8173 EMERALD WINDS CIR BOYNTON BEACH FL 33473 7837 ✓ |
| [00-42-43-25-16-000-0670](https://pbcpao.gov/Property/Details?parcelId=00424325160000670) | 4693 CHERRY RD | 4693 CHERRY RD ✓ | FRASER EUGENIE | FRASER EUGENIE 4693 CHERRY RD WEST PALM BEACH FL 33417 5961 ✓ |
| [00-38-42-34-00-000-3010](https://pbcpao.gov/Property/Details?parcelId=00384234000003010) | US HIGHWAY 98 | US HIGHWAY 98 ✓ | NEW HOPE SUGAR CO | NEW HOPE SUGAR CO PO BOX 408 LOXAHATCHEE FL 33470 0408 ✓ |
| [00-42-44-30-03-000-1230](https://pbcpao.gov/Property/Details?parcelId=00424430030001230) | 4510 HUNTING TRL | 4510 HUNTING TRL ✓ | SCHIAVNE MICHELE A | SCHIAVNE MICHELE A 4510 HUNTING TRL LAKE WORTH FL 33467 3533 ✓ |
| [00-36-44-35-01-000-0190](https://pbcpao.gov/Property/Details?parcelId=00364435010000190) | 6500 S US HIGHWAY 27 | 6500 S US HIGHWAY 27 ✓ | SANCHEZ BROTHERS CORP | SANCHEZ BROTHERS CORP PO BOX 39 SOUTH BAY FL 33493 0039 ✓ |
| [00-40-43-28-10-002-0000](https://pbcpao.gov/Property/Details?parcelId=00404328100020000) | 19011 WOOD STORK WAY | 19011 WOOD STORK WAY ✓ | NORTHERN PALM BEACH COUNTY | NORTHERN PALM BEACH COUNTY IMPROVEMENT DISTRICT 359 HIATT DR PALM BEACH GARDENS FL 33418 7106 ✓ |
| [00-42-47-21-09-003-0070](https://pbcpao.gov/Property/Details?parcelId=00424721090030070) | 7779 CLOVERFIELD CIR | 7779 CLOVERFIELD CIR ✓ | PEREZ AURA | PEREZ AURA 7779 CLOVERFIELD CIR BOCA RATON FL 33433 3048 ✓ |

Differences are expected for owners who changed after the roll was certified (the state roll reflects ownership as of January 1 of the roll year; pbcpao.gov is updated continuously).

## 4. Flagged for manual review

- 00-37-42-20-02-000-0720 732 JOE LOUIS AVE: certificate 2026-192 (tax year 2025) total $207,070.49 vs. market value $8,209. Amount owed on certificate exceeds the parcel market value.

## Manual spot check

[`docs/spot-check.csv`](spot-check.csv) lists every certificate with its address, tax year and amount, plus direct links to the Property Appraiser and Tax Collector record so any row can be checked by hand. Note that the Tax Collector site blocks automated access, so amounts are verified there manually.
