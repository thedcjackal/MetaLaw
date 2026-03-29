# Translation Rules for MetaLaw

These rules are strictly followed by the AI during the translation process. You can edit this file to refine the behavior.

## 1. Page Fidelity & Layout (1:1 Mapping)
- **Structural Integrity (Priority)**: Recreating the original layout is the first priority. All columns, headers, and side-by-side elements MUST align correctly. Use **Tables** for all tabular or multi-column data.
- **Pagination**: Once the layout is accurately recreated, ensure it fits within 1 page per original page.
- **Vertical Compaction**: Only remove empty lines OR reduce font size IF the layout is already accurate and more space is needed for the 1:1 rule.
- **Table Borders**: Use `table.style = 'Table Grid'` for any table that had visible borders. Use borderless tables for invisible alignment.
- **Font Scaling**: Use a base font size of **9.5pt** or **10pt** for the Greek translation to ensure it fits within the same space as the English original.
- **Spacing**: Use single line spacing and skip extra paragraph padding.

## 2. Capitalization
- All letters must maintain their original capitalization.
- **Lowercase stays lowercase.**
- **ALL CAPS stay ALL CAPS.**

## 3. Proper Names & Places (English in Parentheses)
- **Applicability**: This rule applies ONLY to **Proper Names** (People's names, surnames, Cities, Counties, and States).
- **Format**: Put the original English name in parentheses next to the translated Greek name.
- **NO DESCRIPTORS**: Omit generic descriptors like "University of", "State of", or "County of" from the parentheses. Show only the specific proper name.
- **RESTRICTION**: Do NOT apply this parentheses rule to legal titles, document names, or administrative codes (e.g., do not add parentheses for "Government Code" or "Jurat").
- **Example (Institution):** "ΠΑΝΕΠΙΣΤΗΜΙΟ της ΛΕΥΚΩΣΙΑΣ (NICOSIA)" (instead of "(UNIVERSITY of NICOSIA)")
- **Example (Place):** "Πολιτεία της Γιούτα (Utah)"
- **Example (Name):** "Τζορτζ Νίκολσον (George Nicholson)"

## 4. Institutions & Organizations
- **Translate Institutional Names**: Names of professional bodies, associations, and government departments should be translated into the target language.
- **Example**: "National Notary Association" -> "Εθνική Ένωση Συμβολαιογράφων"

## 5. Signatures & Handwriting
- **Placeholder Replacement**: Do not attempt to describe or transcribe handwritten signatures. Replace all physical signatures with the following placeholder based on the target language:
    - **Greek**: `[Υπογραφή]`
    - **English**: `[Signature]`
- **Preserve Placement**: Ensure the placeholder is placed exactly where the signature was in the original layout.

## 6. Date Formats
- **Greek:** `DD/MM/YY` (e.g., 31/12/25)
- **English:** `MM/DD/YY` (e.g., 12/31/25)

## 7. Certification Footer
Add the following text at the end of the document on a new page:

### If Target Language is Greek:
> [!IMPORTANT]
> The Certification Footer MUST be the very last element of the document, following all signatures, and must begin on a brand new page in PORTRAIT orientation.
>
> Το παρόν κείμενο αποτελεί πιστή μετάφραση στην ελληνική γλώσσα από το επισυναπτόμενο, σε επικυρωμένο αντίγραφο, έγγραφο που είναι γραμμένο στην Αγγλική γλώσσα. Εκδίδω δε την μετάφραση αυτή σύμφωνα με το άρθρο 36 παρ.2δ του Κωδ. Δικηγ. βεβαιώνοντας συγχρόνως ότι έχω επαρκή γνώση της γλώσσας από την οποία μεταφράζω. Η ως άνω μετάφραση έχει πλήρη ισχύ έναντι οποιασδήποτε δικαστικής ή άλλης αρχής σύμφωνα με το προαναφερόμενο άρθρο.
>
> Χανιά [CURRENT_DATE]
>
> Η Μεταφράσασα και Βεβαιούσα Δικηγόρος
> __________________________

### If Target Language is English:
> [!IMPORTANT]
> The Certification Footer MUST be the very last element of the document, following all signatures, and must begin on a brand new page in PORTRAIT orientation.
>
>This text constitutes a faithful translation into the English language of the attached document, provided in a certified copy, which is written in the Greek language. I issue this translation in accordance with Article 36, paragraph 2d of the Lawyer’s Code, while simultaneously certifying that I have sufficient knowledge of the language from which I am translating. The above translation has full validity before any judicial or other authority pursuant to the aforementioned article.
>
> Chania, [CURRENT_DATE]
>
> The Translating and Certifying Attorney
> __________________________

## 8. No Omissions (Strict Mandate)
- **ZERO TOLERANCE**: You are forbidden from omitting or summarizing ANY text. Every detail, name, address, stamp, and handwritten note must be preserved and translated.
- **Micro-Font for Space**: If text cannot fit on a page even with 9.5pt font, reduce the font size further (to 8pt or 7pt) but **do NOT** remove any words.
- **Completeness is Priority #1**.
