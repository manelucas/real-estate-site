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

Checked 2026-11-18. A random sample of 20 parcels (half tax-delinquent, half not) was fetched from the Property Appraiser's public site and compared with the database.

- Situs address matches: **17 / 20** (3 of the others are vacant parcels where the state roll lists a street name only and pbcpao.gov shows no situs address)
- Owner name matches: **20 / 20**

| Parcel | Database address | pbcpao.gov address | Database owner | pbcpao.gov owner(s) |
|---|---|---|---|---|
| [02-42-44-36-20-024-0362](https://pbcpao.gov/Property/Details?parcelId=02424436200240362) | GLENBROOK DR | GLENBROOK DR ✓ | PANOSSIAN RAZMIG | PANOSSIAN RAZMIG 398 GLENBROOK DR LAKE WORTH FL 33462 1017 ✓ |
| [00-43-44-20-01-047-0020](https://pbcpao.gov/Property/Details?parcelId=00434420010470020) | SUMMER ST | SUMMER ST ✓ | GROVES WHITE GLADYS & | VANFOSSEN ANKROM FREDA D & VANFOSSEN BAILEY HILMA R & VANFOSSEN POWELL JUDITH & VANFOSSEN WRIGHT BETTY J & VANFOSSEN GLEN L & VANFOSSEN KINNEY RITA D & HAWKENBERRY DONALD L & HAWKENBERRY WILLIAM F & MOORE BRIAN & MOORE JACKIE B & MOORE KRAUSE TWYLA J & MOORE TYRIA & PASSMORE GERALD L & PASSMORE THELMAR L & PASSMORE WILLIAM T & BOYD GEORGE L & GROVES WHITE GLADYS & RIGGS BOYD CAROL A & WALKER BOYD VIVIAN HESTER & NAEGELI PARKER DEBRA & NEISWANGER PARKER KATHERINE & PORTER PARKER VICKI L & BOYD CHRIS E & BOYD DAN E & BOYD RANDY L & BOYD RICKY C & FULTON JON M & FULTON ROBERT D & DAVIS MELVIN L & FUNKHOUSER DAVIS SANDRA D & HEATH DAVIS SHARON & SUTTON DAVIS LYNNE A & GATTEN CHARLES & KASKO GATTEN NORMAN J & MILLER GATTEN BARBARA & PHILLIPS GATTEN SHIRLEY & VANFOSSEN GATTEN BEVERLY WELLS GATTEN LINDA & BALDWIN BATES FAY & BATES BENNIE & VAN DER WEGE BATES RUTH A ASHWORTH BOYD BETTY J & BOYD BENJAMIN & BOYD GREGORY C & BOYD HOWARD R & CARUSO BOYD DIANNA L & FULTON MELVIN & FULTON THOMAS H & KRITZ BOYD PHYLLIS & PATT BOYD PATRICIA L & PORTER FULTON MARCELLA & ROBSON BOYD JO ELLEN & DABO WARD SARAH & KELCH WARD NANCY & SHALLCROSS WARD BETTY L & WARD DONALD & WARD ROGER E & BOSTON MCMAHON DONNA & HAKR MCMAHON ELLA M & MCMAHON CHESTER & MCMAHON GEORGE & MCMAHON PAUL F & FIORE GOODFELLOW DOROTHY L & GOODFELLOW DANNY E & GOODFELLOW RAYMOND E & JOHNSON GOODFELLOW GLADYS I & KETCHOM GOODFELLOW PENNY & SHRINER GOODFELLOW BETTY J & SWICK GOODFELLOW LILLIAN M & PELKEY SHUNK DONNA J & ROUSH SHUNK BRENDA S & SHUNK DONALD A & SHUNK FRANCES K & SHUNK GERALD & SHUNK PENNY J & MCMAHON DAVID & MCMAHON JEFFREY & FULTON CISSY FULTON HOWARD K & FULTON JAMES & FULTON JOSEPH & FULTON PAMELA & HOOVER FULTON VALERIA & WOOD FULTON MARIANNE & HURST MCMAHON DORIS G & MCMAHON KENNETH D JR & MCMAHON THOMAS R & MULLIGAN MCMAHON TRACY D & BARTON GOODFELLOW CAROL A & CREWS THACKER SHERYL L & GOODFELLOW JOHN R & GOODFELLOW MARK D & GOODFELLOW MICHAEL P & GOODFELLOW PAULL D & GOODFELLOW SANDRA A & GOODFELLOW THOMAS R & GOODFELLWO MARY C & RICE GOODFELLOW MYRO J & FREDENBURG BRETT A & GOTTSCHALK FREDENBURG KIMBERLY G & 531 MAIN ST # 2 CALDWELL OH 43724 1324 ✓ |
| [22-42-43-26-00-000-5360](https://pbcpao.gov/Property/Details?parcelId=22424326000005360) | BELVEDERE RD | BELVEDERE RD ✓ | RIVEIRA BONIFACIO J & | RIVEIRA BONIFACIO J & RIVEIRA LEITHIA 1133 MELINDA LN WEST PALM BEACH FL 33417 5816 ✓ |
| [00-41-43-03-00-000-6020](https://pbcpao.gov/Property/Details?parcelId=00414303000006020) | 120TH AVE N |  ✗ | PHILADELPHIA FLORIDA CORP | PHILADELPHIA FLORIDA CORP G W GABLE INC C/O PO BOX 6055 MIAMI FL 33154 ✓ |
| [08-43-45-21-20-008-0081](https://pbcpao.gov/Property/Details?parcelId=08434521200080081) | 218 NE 12TH AVE |  ✗ | HEAD LILLIE QUINCE | HEAD LILLIE QUINCE 566 UDEL LN DELRAY BEACH FL 33445 2432 ✓ |
| [00-41-43-03-00-000-5660](https://pbcpao.gov/Property/Details?parcelId=00414303000005660) | 120TH AVE N |  ✗ | PHILADELPHIA FLORIDA CORP | PHILADELPHIA FLORIDA CORP G W GABLE INC C/O PO BOX 6055 MIAMI FL 33154 ✓ |
| [04-37-43-31-06-003-0070](https://pbcpao.gov/Property/Details?parcelId=04374331060030070) | 348 SW 8TH ST | 348 SW 8TH ST ✓ | CALUSA CONSULTING GROUP LLC | CALUSA CONSULTING GROUP LLC 5162 PALM WAY LAKE WORTH FL 33463 8002 ✓ |
| [00-42-43-23-16-600-2040](https://pbcpao.gov/Property/Details?parcelId=00424323166002040) | 204 OXFORD 600 | 204 OXFORD 600 ✓ | SCHOLER CHRISTINE C | SCHOLER CHRISTINE C 7750 OKEECHOBEE BLVD STE 4-58 WEST PALM BEACH FL 33411 2104 ✓ |
| [00-42-43-27-00-000-5070](https://pbcpao.gov/Property/Details?parcelId=00424327000005070) | 6234 CAMP LEE RD | 6234 CAMP LEE RD ✓ | FLEMING JAMES M & | FLEMING DEBORAH A FLEMING JAMES M & 6234 CAMP LEE RD WEST PALM BEACH FL 33417 5543 ✓ |
| [00-42-43-27-05-063-0960](https://pbcpao.gov/Property/Details?parcelId=00424327050630960) | 122ND PL S | 122ND PL S ✓ | GAMOT ALBERT J JR | GAMOT ALBERT J JR 6029 180TH ST N JUPITER FL 33458 7916 ✓ |
| [48-37-42-09-02-000-0950](https://pbcpao.gov/Property/Details?parcelId=48374209020000950) | 509 E JORDAN BLVD | 509 E JORDAN BLVD ✓ | JUAREZ MARIA E | JUAREZ MARIA E 509 E JORDAN BLVD PAHOKEE FL 33476 1231 ✓ |
| [00-42-45-14-11-006-0116](https://pbcpao.gov/Property/Details?parcelId=00424514110060116) | 5775 PARKWALK DR | 5775 PARKWALK DR ✓ | BASILE DANIELLE | BASILE DANIELLE 828 COPPER MIST CT GRAYSON GA 30017 1926 ✓ |
| [74-43-43-04-13-013-0010](https://pbcpao.gov/Property/Details?parcelId=74434304130130010) | 4200 N TERRACE DR | 4200 N TERRACE DR ✓ | ADDLESBERGER SCOTT | ADDLESBERGER SCOTT ADDLESBERGER SCOTT TR SCOTT ADDLESBERGER TR TITL HLDR 4200 N TERRACE DR WEST PALM BEACH FL 33407 3734 ✓ |
| [00-42-44-14-09-013-0170](https://pbcpao.gov/Property/Details?parcelId=00424414090130170) | 5818 TARRAGON DR | 5818 TARRAGON DR ✓ | BOWLAR KENNETH & | BOWLAR SURRACH BOWLAR KENNETH & BOWLAR SYLVIA 5818 TARRAGON DR WEST PALM BEACH FL 33415 7034 ✓ |
| [00-43-44-07-16-001-0070](https://pbcpao.gov/Property/Details?parcelId=00434407160010070) | 3589 N LIBBY DR | 3589 N LIBBY DR ✓ | RIVERA MARIN JOEDLY & | AGUILAR EMILEY S RIVERA MARIN JOEDLY & 3589 N LIBBY DR WEST PALM BEACH FL 33406 4921 ✓ |
| [68-43-42-09-13-000-2090](https://pbcpao.gov/Property/Details?parcelId=68434209130002090) | 907 MARINA DR 209 | 907 MARINA DR 209 ✓ | BETAR GEORGE M | BETAR GEORGE M 9 HADLAND DR HUNTINGTON NY 11743 2644 ✓ |
| [00-42-45-33-09-000-0690](https://pbcpao.gov/Property/Details?parcelId=00424533090000690) | 7141 HAVILAND CIR | 7141 HAVILAND CIR ✓ | LANGAIGNE SUSAN R | LANGAIGNE SUSAN R 7141 HAVILAND CIR BOYNTON BEACH FL 33437 6463 ✓ |
| [00-42-45-26-25-000-0910](https://pbcpao.gov/Property/Details?parcelId=00424526250000910) | 10072 BOYNTON PLACE CIR | 10072 BOYNTON PLACE CIR ✓ | GENE MERCILISE | GENE MERCILISE 10072 BOYNTON PLACE CIR BOYNTON BEACH FL 33437 2608 ✓ |
| [00-42-43-36-23-003-4131](https://pbcpao.gov/Property/Details?parcelId=00424336230034131) | 4750 ORLEANS CT A | 4750 ORLEANS CT A ✓ | ANDERSON DEMINA | ANDERSON DEMINA 4750 ORLEANS CT APT A WEST PALM BEACH FL 33415 8820 ✓ |
| [00-42-41-27-08-011-0010](https://pbcpao.gov/Property/Details?parcelId=00424127080110010) | 6498 BRANDON ST | 6498 BRANDON ST ✓ | TAPPER GEOFF & | TAPPER BETTE ANN C TAPPER GEOFF & 6498 BRANDON ST PALM BEACH GARDENS FL 33418 1493 ✓ |

Differences are expected for owners who changed after the roll was certified (the state roll reflects ownership as of January 1 of the roll year; pbcpao.gov is updated continuously).

## 4. Flagged for manual review

- 00-37-42-20-02-000-0720 732 JOE LOUIS AVE: certificate 2026-192 (tax year 2025) total $207,070.49 vs. market value $8,209. Amount owed on certificate exceeds the parcel market value.

## Manual spot check

[`docs/spot-check.csv`](spot-check.csv) lists every certificate with its address, tax year and amount, plus direct links to the Property Appraiser and Tax Collector record so any row can be checked by hand. Note that the Tax Collector site blocks automated access, so amounts are verified there manually.
