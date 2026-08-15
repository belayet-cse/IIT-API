// Seed data for the `blogs` table.
// Content is stored as plain text (no iitrade.org links or hosted images) so it can be
// migrated to any future rich-text/HTML representation without carrying external references.

export interface BlogSeedItem {
  title: string;
  slug: string;
  category: string;
  readingTime: number;
  publishedAt: string;
  content: string;
}

export const blogsSeedData: BlogSeedItem[] = [
  {
    title: 'The rational and practical meaning of "express indication"',
    slug: 'the-rational-of-express-indication-and-its-practical-meaning',
    category: 'UCP',
    readingTime: 5,
    publishedAt: '2025-08-08T18:14:20.248Z',
    content: `Introduction

UCP 600 is a rule of practice, not a law. Neither the International Chamber of Commerce (ICC) nor the UCP 600 has the authority to make UCP 600 mandatory for documentary credit transactions. It is up to the commercial parties involved, and subsequently the banks, to decide whether to adopt UCP 600 as a guiding framework for their transactions. This article explores the evolution of the Uniform Customs and Practice for Documentary Credits (UCP) from the general requirement of an "adherence list" to the specific requirement of an "express indication" for each documentary credit that governs a documentary credit transaction. We will also examine the rationale and practical implications of the "express indication" as outlined in Article 1, specifically regarding its relevance to day-to-day operations involving documentary credits.

Journey from "Adherence list" to "Express Indication"

UCP was not the preferred rule for documentary credit in earlier days. The first version, UCP 82 (1983), was only adopted by a few European countries, including Germany, France, Italy, Romania, Switzerland, Belgium, and the Netherlands. In contrast, UCP 151 (1951) was quickly adopted by banks in 28 countries collectively, while an additional 49 countries had done so on an individual basis. This marked a significant increase in support for the UCP as a standard for documentary credit operations. The United States adopted the UCP as the governing rules for all letters of credit, both for imports and exports, back in 1956. During that time, two primary practices dominated the market: "UCP practice" and "London practice." However, the limited involvement of banks in the United Kingdom posed a significant challenge to achieving global acceptance of the UCP. Eventually, British and Commonwealth banks adopted UCP 222 in 1962, leading to the UCP gaining worldwide recognition as a universal set of rules for documentary credit operations.

Until UCP 290 (1974), the rule regarding the application of UCP to a particular transaction was unclear, whether through express indication in the credit or otherwise. The "GENERAL PROVISIONS AND DEFINITIONS" stated in point (a) that "These provisions and definitions and the following articles apply to all documentary credits and are binding upon all parties thereto unless otherwise expressly agreed." During that period, the rule left the expectation to the issuing bank to expressly indicate UCP as a governing rule of practice for their transaction.

Additionally, the International Chamber of Commerce (ICC) developed and maintained an "Adherence List" for its members who wish to conduct their documentary credit operations in accordance with the UCP. UCP 400 (1983), Article 1, for the first time required that a credit should indicate that it is subject to UCP. This addition significantly reduced the importance of maintaining the "Adherence List." Consequently, at the ICC Banking Commission's fall meeting in 2000 in Istanbul, the commission reached a consensus to eliminate the "Adherence List."

The rationale of "Express Indication" in the text of the Credit

UCP 600 consists of a private set of rules-not laws-that govern documentary credit transactions. As long as applicable laws do not prohibit it, commercial parties are free to apply any rules or even operate without any rules for their documentary credit transactions based on the principle of "freedom of contract." Neither UCP 600 nor the ICC mandates that commercial parties or banks must open documentary credits in accordance with UCP 600. For this reason, UCP 600 requires an explicit indication in the text of the credit stating that the credit is subject to UCP 600. Only then do the relevant provisions of the rules become binding on all involved parties.

Practical meaning of "Express Indication"

UCP 600, Article 1, states that "UCP are rules that apply to any documentary credit..., when the text of the credit expressly indicates that it is subject to these rules." This explicit indication serves as a mandate that governs the credit and binds the parties under the UCP 600 framework. Typically, this clear indication is included in the SWIFT MT 700, specifically in field 40E of the documentary credit: Field 40E: Applicable Rules - UCP LATEST VERSION, OR UCP URR LATEST VERSION.

In MT 700, Field 40E: UCP LATEST VERSION means that the credit is subject to the latest version of the ICC Uniform Customs and Practice for Documentary Credits (UCP 600).

In MT 700, Field 40E: UCP URR LATEST VERSION means that the credit is subject to the latest version of the ICC Uniform Customs and Practice for Documentary Credits, and the reimbursement is subject to the latest version of the Uniform Rules for Bank-to-Bank Reimbursements (URR 725).

When UCP 600 becomes mandatory local Regulations or a Law

Almost all documentary credits issued today are governed by UCP 600. The widespread adoption of the Uniform Customs and Practice for Documentary Credits (UCP) as a standard practice encourages many local authorities to incorporate UCP 600 as a mandatory rule for the operation of documentary credits. This requirement is sometimes explicitly stated through a central bank circular, or in some instances, local letters of credit law recognizes the UCP as a mandatory rule of practice, except in cases of fraud, abuse, nullity, and similar issues. With these directives, UCP 600 effectively becomes a mandatory regulation or part of local law for those countries.`,
  },
  {
    title:
      '"Any Documentary Credits"- Meaning, Brief History, Types of Application, Recommendation',
    slug: 'any-documentary-credits--meaning-brief-history-types-of-application-recommendation',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2025-07-30T06:05:05.701Z',
    content: `Meaning

Commercial Letters of Credit, Standby Letters of Credit, and Demand Guarantees are part of the "Independent Undertaking" family. Each of these types serves distinct business needs despite belonging to the same family. The International Chamber of Commerce (ICC) has established specific rules for each type of transaction to maintain consistency in customs and practice at various stages of a transaction. Nonetheless, all members of the "Independent Undertaking" family possess unique characteristics, namely Irrevocable, Independent, Documentary, and Binding features. Therefore, the term "any documentary credit" encompasses all forms of documentary credit-Commercial Letters of Credit, Standby Letters of Credit, and Demand Guarantees-and may be issued subject to UCP 600.

Brief History

The ICC Banking Commission first addressed this issue in a meeting on March 14, 1977. They determined that standby credits fall under the definition of documentary credit, as outlined in paragraph (b) of the General Provisions and Definitions in UCP 290 (Publication No. 371, page 11, item R.1).

Types of Application

While all types of independent undertakings may be subject to UCP 600, the ICC has established separate sets of rules for each type of undertaking: Commercial Letters of Credit are subject to UCP 600; Standby Letters of Credit are subject to ISP 98; Demand Guarantees are subject to URDG758. Despite a separate set of rules available to cover each type of transaction, because of the common features of each type of undertaking, practitioners are allowed to choose any set of rule, at their discretion, for a particular transaction. In this context, there are two types of applications for each set of rules: a) Intended application, and b) Permissible application.

a) Intended Application - It refers to the type of independent undertaking for which these Rules were intended. The intended rule for commercial letters of credit is UCP 600. UCP 600 is a set of rules (uniform customs and practices) that captures various stages of the commercial letters of credit, such as issuance, amendment, presentation, examination, settlement, transfer, and assignment, consistent with the commercial letters of credit business.

b) Permissible Application - It refers to another type of independent undertaking that was not the primary focus of the Rules. Because family members share common features within the context of the independent undertaking, these other undertakings could also be allowed under the Rules. For instance, the rule that applies to commercial letters of credit is UCP 600. However, standby letters of credit and demand guarantees are also permitted to be issued under UCP 600.

Recommended Approach

Practitioners are recommended to select the appropriate rule for each type of undertaking, provided that their applicable law does not prohibit it.`,
  },
  {
    title:
      '"They are binding on all parties thereto..." Who are they, how are all parties binding, and when are all parties binding',
    slug: 'they-are-binding-on-all-parties-thereto-who-are-they-how-are-all-parties-binding-and-when-are-all-parties-binding',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2025-08-15T18:11:15.908Z',
    content: `"When the text of the credit expressly indicates that it is subject to these rules. They are binding on all parties thereto..." To further clarify this highlighted part of the rule, we need to explore the following key questions: Meaning of the word "they"? Who are all the parties? Meaning of the word "binding"? When (the timing) are the parties bound by these rules?

Meaning of the word "they"?

It refers to the applicable provisions of UCP 600.

Meaning of "all Parties"

The term "all parties" refers to all the parties involved in a documentary credit transaction. Parties involved in a typical documentary credit transaction are the applicant, beneficiary, issuing bank, advising bank, confirming bank, and nominated bank. Among the banks involved in a transaction, the issuing bank and the confirming bank (if any) bear an independent undertaking to the beneficiary. In this context, the main parties are the issuing bank, the confirming bank (if any), and the beneficiary.

Meaning of the word "binding"

The term "binding" is used in Article 1 in two different contexts:

Context 1 - When a documentary credit is issued under UCP 600, without any modifications or exclusions, all applicable provisions of UCP 600 will apply and bind all parties involved.

Context 2 - When a documentary credit is issued subject to UCP 600 with any modification or exclusion, the applicable provisions of UCP 600 that are not modified or excluded will apply and bind all parties involved. The credit condition will prevail (bind) over the respective UCP 600 provision for any modification. When the credit expressly excludes any provision of UCP 600, this particular provision will not apply or bind the parties to the transaction. In most cases, when an exclusion occurs, the credit must include a new rule to replace the excluded language or article. This new rule in the credit will take precedence over the respective excluded rule of UCP 600.

When (the timing) the primary parties are binding

The primary parties of a documentary credit are the issuing bank, confirming bank (if any), and the beneficiary.

When the issuing bank is bound - An issuing bank is irrevocably bound to honour as of the time it issues the credit [UCP 600, sub-article 7 (b)]. In other words, the issuing bank is bound by the credit when the credit leaves the operational control of the issuing bank.

When the confirming bank is bound - A confirming bank is irrevocably bound to honour or negotiate as of the time it adds its confirmation to the credit [UCP 600, sub-article 8 (b)].

When the beneficiary is bound - There is no direct reference as to when the beneficiary is bound to the credit. However, according to UCP600, sub-article 6 (a), "Except as provided in sub-article 29 (a), presentation by or on behalf of the beneficiary must be made on or before the expiry date." Under this given context, UCP 600, sub-article 7 (a) stipulates that "Provided that the stipulated documents are presented to the nominated bank or to the issuing bank and that they constitute a complying presentation, the issuing bank must honour..." The presentation that states in sub-article 7 (a) is the presentation made by the beneficiary. Hence, the beneficiary is bound to the credit as of the time it makes a presentation.`,
  },
  {
    title: 'Decoding the definition of the "Advising Bank"',
    slug: 'decoding-the-definition-of-the-advising-bank',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2025-09-20T02:33:25.332Z',
    content: `Theoretically speaking, a documentary credit transaction can be executed with a minimum of two parties: the issuing bank and the beneficiary.

However, in international trade, the issuing bank is generally located geographically distant from the beneficiary and may not have a branch or office in the beneficiary's country. Consequently, the issuing bank often uses the services of a correspondent bank to advise the credit to the beneficiary.

The term "Advising bank" is defined in UCP 600, Article 2 as "the bank that advises the credit at the request of the issuing bank." There are two vital components in the definition of "Advising bank": (a) A request from the issuing bank to a bank to advise the credit, and (b) That the requested Advising bank advises the credit. The former component is the mandate from the issuing bank to act as an advising bank, and the latter component is the action (advising the credit) to become an advising bank. Technically speaking, when the requested advising bank elects not to advise a credit, it does not fulfill the latter part of the advising bank's definition [point (b)], and thus is not an advising bank under UCP 600, Article 2.

Most documentary credits are transmitted through SWIFT (Society for Worldwide Interbank Financial Telecommunications), utilizing the message type MT700. In MT700, the sender is the issuing bank, and the receiver is the requested advising bank to advise the credit to the beneficiary. Once the bank advises the credit (that advises the credit) to the beneficiary, it becomes the "Advising bank."`,
  },
  {
    title: 'Documents forward on "Collection Basis"',
    slug: 'documents-forward-on-collection-basis',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2025-09-13T01:32:52.310Z',
    content: `Context 1: Beneficiary's Presentation within the expiry date of the credit

The beneficiary made a presentation to a nominated bank within the expiry date of the credit. After reviewing (examining) the presentation, the nominated bank identified several valid discrepancies and notified the beneficiary. In response, the beneficiary requested the nominated bank to forward the documents to the issuing bank on a "collection basis." The nominated bank complied with this request and sent the documents to the issuing bank, noting in its covering schedule that "the presentation has been sent on a 'collection basis.'" What actions should the issuing bank take in this situation? Should the nominated bank or the beneficiary send documents on a "collection basis"? What happens if the presentation expressly indicates that the presentation is subject to URC 522?

Issuing Bank Action - During the UCP 500, the ICC Banking Commission addressed a similar issue in its Official Opinion R537 / TA77. The Opinion:

Discouraged the Practice - The opinion began with discouraging the use of the expression "collection basis" as it has no meaning or interpretation under UCP 500.

Recommended Standard Practice - The opinion recommended standard wording for the covering schedule to handle documentary credit transactions that "These documents represent a presentation under the terms of your Documentary Credit No..." or similar.

Conclusion - The Banking Commission opined that the issuing bank must adhere to the provisions outlined in UCP 500, specifically Article 14. It implies that the issuing bank is obligated to examine the documents and provide an adequate and timely "Notice of Refusal" in accordance with UCP 500.

Consequence of Mis-Handling - If the issuing bank fails to follow the requirements of this Article, it will be precluded from asserting that the documents do not meet the terms and conditions of the Credit as specified in UCP 500, sub-article 14 (e).

Current Status of the Opinion - This opinion is valid under UCP 600.

Context 2: Beneficiary's presentation under a credit within the expiry, but subject to URC 522

When the nominated bank forwarded a presentation under a credit, noting in its covering schedule that "the presentation has been sent on a 'collection basis,'" subject to The Uniform Rules for Collections, 1995 Revision, ICC Publication No. 522.

Handling the transaction - The instruction for handling the presentation under the documentary collection, subject to URC 522, replaces the guiding Rules UCP 600 to URC 522. This implies that the presentation is not handled under the UCP 600. If the buyer opts not to pay, the bank may return the documents.`,
  },
  {
    title: 'The meaning of "UCP are Rules"',
    slug: 'the-meaning-of-ucp-are-rules',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2025-09-06T02:22:30.247Z',
    content: `While practitioners have often considered the UCP (Uniform Customs and Practice for Documentary Credits) as a "Rule", no prior versions of the UCP explicitly stated in the text of the UCP that "UCP are Rules". UCP 600 have made such a recognition for the first time. Let us explore reasons behind such an expression:

Improved Drafting Style and Definitive Text

The UCP 600 have made significant improvements in style and readability by revising the language and eliminating vague concepts. Phrases like "unless otherwise stipulated in the credit", or similar, which appeared frequently in earlier versions throughout the articles, have now been redrafted and replaced in Article 1, stating that any modification or exclusion must be expressly stated in the documentary credit itself. The legal term "reasonable time" has now been replaced with a specific time frame: "a maximum of five banking days". Phrase like "appear on their face" is now mentioned only in one place instead of many places as appeared in UCP 500. These three are just examples of many such improvements in the text of the UCP 600.

Universal Acceptance and Customary Usage

Almost all documentary credits issued today are governed by UCP 600. The widespread adoption of the UCP as a standard practice encourages many local authorities to incorporate the UCP as a mandatory "Rules" for the operation of documentary credits. This requirement is sometimes explicitly stated through a central bank circular or, in some instances, local letters of credit law. The UCP becomes a mandatory rule of practice for those countries. Even when such an express indication is not made and no other rules are specified, courts generally apply UCP provisions as customary practices for documentary credits.

Positive Relationship with Law

There is a harmonious relationship between the applicable law and the UCP to the extent not prohibited by the law. Courts in different jurisdictions generally do not interfere with the machinery of documentary credits and uphold UCP provisions in most cases, with the exception of cases involving fraud, abuse, or nullities that conflict with public policy. In this context, Article 1 of UCP 600 acknowledges the widespread acceptance of the UCP and recognizes the same by stating "UCP 600 are Rules".`,
  },
  {
    title: 'Decoding the definition of the "Applicant"',
    slug: 'decoding-the-definition-of-the-applicant',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2025-10-17T23:58:43.484Z',
    content: `Identify the Key Elements

UCP 600, Article 2 defines the term "Applicant means the party on whose request the credit is issued." The definition includes two key elements: the Applicant is referred to as a party, and it places a request to the bank to establish a documentary credit.

The Applicant as a Party

UCP 600 (2007) defines an applicant as a "party"- broadening the concept beyond the bank's customer as defined in UCP 500.

Is the applicant a Party to the documentary credit? The use of the term "party" in the definition is not intended to include the Applicant as a party to the documentary credit, but to reflect the concept that the Applicant can mean an entity other than the bank's actual customer, according to the Commentary of UCP 600, ICC publication no. 680. Hence, the Applicant has no right to intervene in the decision-making process at any stage of the documentary credit operations, including but not limited to issuance, amendment, presentation, and settlement.

For example: The definition of Documentary credit clearly stipulates that the credit is an undertaking of the issuing bank to honour a complying presentation. The issuing bank may, in its sole judgment, approach the applicant for a waiver of the discrepancies [UCP 600, sub-article 16 (b)]. After serving the Notice of Refusal, the issuing bank may agree or disagree with the applicant's acceptance of the waiver [UCP 600, sub-article 16 (c)(iii)(b)].

Although the Applicant is not a party to a documentary credit, some provisions of UCP 600 have a direct impact on the Applicant. For Example: A bank that uses another bank's services to execute the applicant's instructions does so for the account and at the risk of the applicant [UCP 600, sub-article 37 (a)]. The applicant shall be liable to indemnify the bank against all obligations and responsibilities imposed by foreign laws and practices [UCP 600, sub-article 37 (d)].

At the request of the Applicant

This contract, commonly referred to as the reimbursement contract, may relate to either a specific transaction or a series of transactions, depending on the relationship between the issuing bank and the involved party. It effectively separates the party from the underlying sales or purchase contract. The party is obligated to reimburse the issuing bank for honoring a complying presentation under a credit, without any disputes arising from the underlying transaction. Technically speaking, through this agreement, the Applicant acknowledges that they are dealing with documents, not goods, services, or performance, before the issuance of the requested documentary credit.

Does the Applicant requesting the credit issuance need to match the name indicated in Field 50? UCP 600, Article 2, the definition of the Applicant emphasizes the party that requested the opening of a documentary credit. In most cases, the requested party and the Applicant name appear in the credit are the same. Sometimes, the issuing bank may not have a credit appetite for the importer of the underlying contract. In this situation, a credible party approved by the issuing bank may request the bank to issue a documentary credit for the importer.`,
  },
  {
    title:
      'The meaning of "to the extent to which they may be applicable, any standby letter of credit"?',
    slug: 'the-meaning-of-to-the-extent-to-which-they-may-be-applicable-any-standby-letter-of-credit',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2025-08-05T03:12:37.242Z',
    content: `Are all Articles of UCP 600 compatible with standby letters of credit? The simple answer is "No".

UCP 600 is designed to govern commercial letters of credit, not standby letters of credit. As a result, some Articles that are essential for commercial letters of credit are not appropriate for standby letters of credit. For instance: Articles related to transport documents, such as Articles 19-25, Article 26, and Article 27, are not commonly practiced in standby operations.

During the drafting of UCP 500, "National Committees (NCs) commented on the possibility of identifying the individual Articles applicable to the Standby Credit. It was decided that this request could not be met. NCs must acknowledge that ...the majority of the Articles do not apply to the Standby credit. It is recognized that the parties to the Credit may wish to exclude certain Articles of the UCP from a specific type of Credit. If such is their desire, they should state this clearly in the terms and conditions of the Commercial Credit or the Standby Credit." - Documentary Credits UCP 500 and 400 Compared (ICC Publication No. 511)

To clarify this incompatibility of using UCP 500 in standby letters of credit, Article 1 of UCP 500 explicitly states for the first time that UCP 500 "...shall apply to all Documentary Credits (including to the extent to which they may be applicable, Standby Letter(s) of Credit). The same principle continues in UCP 600, Article 1, stating that UCP 600 "are rules that apply to any documentary credit ("credit") (including, to the extent to which they may be applicable, any standby letter of credit)."`,
  },
  {
    title:
      'When do we use a Second Advising Bank? Is it mandatory to follow the instructions of the issuing bank?',
    slug: 'when-do-we-use-a-second-advising-bank-are-all-second-advising-bank-advising-bank',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2025-10-04T06:33:54.440Z',
    content: `The practice of using a second advising bank was common even without any official acknowledgment in the UCP. The drafting group of UCP 600 recognized that this practice is beneficial for facilitating trade and included it in sub-article 9(c) of UCP 600.

"An advising bank may utilize the services of another bank ("second advising bank") to advise the credit and any amendment to the beneficiary."

When do we use a Second Advising Bank?

Sometimes a situation arises where the beneficiary requires advising the credit through a specific bank (often the beneficiary bank) with whom the issuing bank has no SWIFT RMA (Relationship Management Application). In such a circumstance, the issuing bank selects an advising bank from its correspondent banking relationships list and mentions the specific bank name as "advise through bank".

Is it mandatory to follow the instructions of the issuing bank?

Should the advising bank adhere to the instructions provided by the issuing bank? The answer lies in UCP 600, sub-article 9 (c): "An advising bank may utilize the services of another bank (second advising bank) to advise the credit and any amendment to the beneficiary..." The use of the word "may" provides the advising bank an option to employ the services of a second advising bank at its discretion. In simple terms, the advising bank may or may not utilize the services of a second advising bank to advise a credit to the beneficiary.

This sub-article allows the advising bank to choose a second advising bank at its discretion, regardless of the instruction in the credit. Hence, an advising bank does not need to adhere to the instructions provided by the issuing bank.`,
  },
  {
    title: '"Modification and Exclusion"- Necessity and Generic Guidance',
    slug: 'modification-and-exclusion--rationality-necessity-recklessness-and-overall-guidance',
    category: 'UCP',
    readingTime: 4,
    publishedAt: '2025-08-23T03:18:33.710Z',
    content: `Introduction

The UCP 600 is a set of rules that incorporates all uniform customs and practices to govern documentary credits. Sometimes, the governing law or the parties involved in the transactions may require specific data elements that conflict with the requirements outlined in the respective UCP 600 provision. There may also be commercial reasons to exclude one or more UCP 600 provisions for a particular transaction. In this context, we will explore answers to the following questions from the UCP 600 and various ICC official Opinions: Does the UCP 600 allow us to modify or exclude any of the provisions? How can we modify or exclude the text of the credit? What will be the treatment of modified or excluded conditions over the respective UCP 600 provision? Are there any general guidelines for modification or exclusion?

Does UCP allow modification or Exclusions

At the outset, the UCP 600, Article 1 permits modification or exclusion, stating "...They are binding on all parties thereto unless expressly modified or excluded by the credit." Despite UCP 600 permits to change the meaning (modification) or expel (exclusion) any of the UCP 600 provisions to a particular transaction, the issuing bank must appraise that a few UCP 600 provisions such as but not limited to Article 7 (issuing bank undertaking) and Article 8 (confirming bank undertaking) etc. are fundamental to the core documentary credits operation. It should keep outside the scope of any modification or exclusion.

Guidance for Modification or Exclusion: Driven by [ICC Official Opinion R716 / TA704rev]

Modification to the rules does not necessarily require a bank to specifically state the article that has been modified or the manner in which it has been modified. For example, the insertion of "15" in field 48 (Presentation Period) of an MT700 would modify the rule stated in sub-article 14 (c) that presentation must be made by or on behalf of the beneficiary not later than 21 calendar days after the date of shipment. There is no explanation of the modification, but the insertion of "15" clearly creates a modified rule in respect of the presentation period.

Exclusion to the rules for whatever reason, there must be an express indication of this, by saying, for example, "Sub-article 14 (i) is excluded." For Example, a revolving credit has been issued, allowing monthly drawings of $25,000 for six months, along with a condition that "UCP 600, Article 32" is excluded. The purpose of this exclusion is to ensure that credit drawings can continue even if any prior drawings have not been made. However, in most cases when an exclusion occurs, the credit will need to contain a new rule replacing the language or article excluded.

For Examples: The exclusion of sub-article 14 (i), this would necessitate the credit stating the new conditions relating to the dating of documents [ICC Official Opinion R716 / TA704rev]. The exclusion of sub-article 14 (f) without any further comment, how is a nominated bank expected to review documents for which there is no stated issuer or data content? [ICC official opinion R634 / TA638rev]

Generic guideline for modification or exclusion of any UCP provisions: [Driven by ICC Official Opinion R634 / TA638rev]

Generic Guideline (modification) - Where a modification is made, the issuing bank must ensure that the revised wording in the credit is sufficiently descriptive so that there may be no ambiguity as to how it may be interpreted or applied.

Generic Guideline (Exclusion) - It should also be noted by banks that if they are considering the exclusion of a rule, it is often not as simple as merely making a statement in the credit that article X or sub-article X is deleted or is not to apply. Very often there needs to be something put into the credit to cover the void that the exclusion leaves. The issuing bank should keep any exclusions (if at all needed) to a minimum.

Old African proverb should be the mantra

We can take the best advice regarding modification or exclusion of any article or sub-article of UCP 600 from an old African proverb: "If you take from a man his tribal customs, you'd better have something of value to replace them."`,
  },
  {
    title: 'Roles of the Applicant in a documentary credit',
    slug: 'definition-and-role-of-the-applicant-in-a-documentary-credit',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2025-10-25T04:16:54.914Z',
    content: `General Interpretation

The first step in any international trade cycle is to establish a contract between the importer and the exporter. When the contract specifies that "a documentary credit is to be issued", the importer is required to provide a documentary credit to the exporter that adheres to the terms and conditions outlined in the contract. Consequently, the importer needs to approach a bank to issue the required documentary credit. Documentary credit issued through FIN 700 (Issue of a Documentary Credit) indicates the applicant in mandatory Field 50.

In this context, UCP 600, Article 2 defines the term "Applicant means the party on whose request the credit is issued." The definition includes two key elements: the Applicant is referred to as a party, and it places a request to the bank to establish a documentary credit.

Roles of the Applicant under a Documentary Credit

Although the applicant is not a party to the documentary credit under UCP 600, they play a significant role in facilitating its operation. Other than reimbursing the issuing bank for honouring a complying presentation, the applicant typically performs the following functions: requests the issuing bank to open a documentary credit; requests the issuing bank to amend or cancel the documentary credit; responds to the issuing bank's requests for waiving discrepancies; is responsible for paying fees, charges, commissions, and other related costs.`,
  },
  {
    title:
      'The reference of Standby Letters of Credit in UCP-When it was first recognized, how it evolves from one UCP version to another',
    slug: 'the-reference-of-standby-letters-of-credit-in-ucp-when-it-was-first-recognized-how-it-evolves-from-one-ucp-version-to-another',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2025-08-02T10:08:25.359Z',
    content: `From UCP 82 (1933) to UCP 290 (1974)

Before UCP 290 (1974), the UCP did not include a reference to standby letters of credit. During the lifetime of UCP 290(1974), in March 1977, the ICC Banking Commission responded positively to the query of whether a "standby Letter of credit (SBLC)" was under the coverage of "Any Documentary Credit" of UCP 290 or not. This response is included in ICC Publication No. 371, page 11.

UCP 400 (1984)

The first reference to the SBLC in a UCP set of rules was in UCP 400 (1983). The logic behind incorporation of SBLCs into UCP was that: "Because standby letters of credit were being increasingly used in a growing number of countries and Publication No 371 may not have been known to all concerned with standby letters of credit, it was considered desirable to remove any doubt and to make it clear by wording in the UCP that the UCP applied to such letters of credit." - UCP 1974/1983 Revisions Compared and Explained (ICC Publication No. 411)

UCP 500 (1993)

During the lifetime of UCP 400, ICC also published a new set of rules called Uniform Rules for Demand Guarantees (URDG), ICC Publication No. 458, in 1993, which basically intended to cover a "non-performance (default)" situation similar to SBLC. It is because of this reason, that the UCP500 drafting group raised the matter once again "whether the proposed UCP will make reference of SBLC or not". Finally, UCP500 maintained reference to the SBLC due to the following reason: "While the Standby Credit is, from a legal viewpoint, equal to the demand guarantee, there are important differences between the two. The Standby Credit has developed into an all-purpose financial support instrument embracing a much wider range of uses than the normal demand guarantee. For this reason, and since the UCP is the most suitable and compatible set of rules with the basic character of the Standby Credit, the link between the Standby Credit and UCP was maintained." - Documentary Credits UCP 500 and 400 Compared (ICC Publication No. 511)

UCP 600 (2007)

During the revision of UCP 500, ICC national committees posed the same question once again and requested the drafting group to delete the SBLC reference from UCP since the most suitable publication (ISP98) for SBLCs was in the market. However, the drafting group declined the request. "[D]espite the introduction of ISP98, there were still a significant number of standby credits that continued to be issued subject to the UCP. The Drafting Group also believed that even if the reference were deleted, banks would continue to issue standby credits subject to the UCP." - Commentary on UCP 600 (ICC Publication No. 680)`,
  },
  {
    title: 'Selecting the Advising Bank: Compliance with UCP 600',
    slug: 'choosing-the-advising-bank-adhering-to-ucp-600',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2025-09-26T18:07:55.836Z',
    content: `Introduction

Almost all documentary credits are now issued through an advising bank. Selecting the right advising bank to facilitate a transaction within the expected timeframe is crucial. However, there may be instances where unexpected delays occur, even after choosing an appropriate advising bank based on prior transactional experience, especially given current compliance requirements. The question arises: who is liable for any unexpected delays in advising a credit-the applicant or the issuing bank? There is no universal answer to this question; it depends on how the advising bank is selected for each specific transaction. We will explore a step-by-step process for selecting an advising bank in everyday transactions.

Step 1: When the applicant specifies an advising bank in the application

The applicant's request to open a documentary credit usually included the issuing bank's prescribed application form. In this form, the applicant may specify a bank name as an "advising bank" for the transaction. The issuing bank must follow the instructions. The issuing bank will not be held liable for any consequences that arise from a delay in advising the credit, as per UCP 600, Article 35, paragraph 1.

When the issuing bank selects a different advising bank contrary to the one listed in the application form, it may lead to problems (financial or non-financial) if the chosen bank delays advising the credit, resulting in potential losses for the applicant.

If the issuing bank has any concerns about using the proposed advising bank, it must amend the application form before proceeding with a different bank to advise the credit.

Step 2: When the applicant does not specify an advising bank in the application

In the absence of any instructions from the applicant, the issuing bank may have taken the initiative to select an advising bank to facilitate the transaction. The issuing bank may take the following steps: a) If the issuing bank has a direct Relationship Management Application (RMA) with the beneficiary's bank, it should select this bank as the advising bank for the credit. b) If no such relationship exists, the issuing bank may choose a bank from its list of correspondent banks that is suitable for the transaction.

While selecting the advising banks, the issuing bank must consider that: not all correspondent banks will advise credits for non-customers - the chosen advising bank may need to undergo additional due diligence before it can provide advising services; even where the proper due diligence is in place for advising a credit, the chosen advising bank may be restricted to advise on a specific type of underlying goods.`,
  },
  {
    title:
      'Should the requesting party for issuance of a credit and the applicant named appear in the credit be the same? Is it mandatory to have "one applicant" for each documentary credit?',
    slug: 'is-it-mandatory-to-have-one-applicant-for-each-documentary-credit',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2025-11-01T02:30:44.649Z',
    content: `Should the requesting party for issuance of a credit and the applicant named appear in the credit be the same?

Many trade practitioners observe that the party requesting an issuing bank to issue documentary credits often matches the applicant named in the credit itself. This observation can create a misleading impression that these two parties must be the same. However, there may be situations in which the party requesting the issuing bank to issue a documentary credit differs from the party (importer) involved in the underlying contract. These situations include, but are not limited to: the issuing bank has a credit line with its parent company, while the underlying contract is established with a sister company (importer); or the party (importer) involved in the underlying contract has a credit line with a different financial institution, like a leasing company or a bank that does not engage in international trade, but has an arrangement with the issuing bank to issue a documentary credit on behalf of its customer.

In summary, there may be situations in which the issuing bank is unable to assume the credit risk associated with the party under the underlying contract. However, the bank is willing to issue the documentary credit if it receives a request from a party with a stronger credit profile that is acceptable to the issuing bank. To cover all eventualities, UCP 600, Article 2, defines the term "Applicant" as "the party on whose request the credit is issued."

Is it mandatory to have "one applicant" for each documentary credit?

Most documentary credits issued regularly show only one applicant's name. This raises an interesting question: Can a credit have more than one applicant? The ICC Banking Commission addressed this question during the lifetime of UCP 500. The commission received a query (TA 563/R 508) concerning eleven applicants, whose details were outlined in the credit. The following terms and conditions apply: partial shipments are prohibited; the beneficiary must present the required documents to each Applicant; all documents must reference the pro forma invoice number associated with each Applicant.

The ICC Banking Commission concluded that: "Provided that all the goods are shipped on the same means of conveyance and for the same journey (as stated in the credit), the issuance of separate transport documents, together with separate copies of the other required documents covering the goods required by each applicant, will not create a discrepancy. Whilst this form of documentary credit issuance is not common, it is not outside the scope of UCP and, properly constructed, would be in compliance with the UCP."`,
  },
  {
    title: 'The Definition of Complying Presentation',
    slug: 'the-definition-of-complying-presentation',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2025-12-13T10:14:11.913Z',
    content: `UCP 600, Article 2 - Complying Presentation

"Complying presentation" means a presentation that is in accordance with the terms and conditions of the credit, the applicable provisions of these rules and international standard banking practice.

General Interpretation

Article 2 of UCP 600 outlines a hierarchical approach for banks to determine whether a presentation is complying. This hierarchical approach includes three conditions: first condition, the presentation of documents must comply with the terms and conditions of the documentary credit; second condition, the presentation of documents must comply with the rules contained in UCP 600 that are applicable, i.e., those that have not been modified or excluded by the terms and conditions of the documentary credit; and third condition, the presentation of documents must comply with international standard banking practice. The first two conditions are determined by looking at the specific terms and conditions of the Credit and the rules themselves. The third condition permits bankers to examine documents in accordance with international standard documentary credit practices.

Third Condition Test: Only When Needed

Technically speaking, all presentations made under a credit must satisfy the terms and conditions of the Credit (first condition) and applicable provisions of the rules (second condition). If any issues remain unresolved after examining a presentation with the first two conditions, only then should the examiner consider the international standard banking practice as the third condition.

Exception to the Hierarchical Approach

There are at least three possible exceptions to this hierarchy where provisions of UCP 600 supersede terms and conditions of the credit or amendment: a provision in an amendment to the effect that the amendment shall enter into force unless rejected by the beneficiary within a certain time shall be disregarded [UCP 600 sub-article 10 (f)]; if a credit contains a condition without stipulating the document to indicate compliance with the condition, banks will deem such condition as not stated and will disregard it [Article 14 (h) of UCP 600]; and a bill of lading indicating that transhipment will or may take place is acceptable, even if the credit prohibits transhipment, if the goods have been shipped in a container, trailer or LASH barge as evidenced by the bill of lading [Article 20 (c)(i),(ii) of UCP 600] - similar provisions also exist in articles 19, 21 and 22.`,
  },
  {
    title:
      'Where modification is needed for sound business reasons: ICC Official Opinion R653 / TA632rev',
    slug: 'where-modification-is-needed-for-sound-business-reasons-icc-official-opinion-r653-ta632rev',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2025-08-30T01:30:36.724Z',
    content: `Introduction

Any modification or exclusion of provisions in UCP 600 must be carefully considered and based on mandatory local law requirements or sound business rationale. In many countries, local regulations require a signed commercial invoice, whereas UCP 600 does not require a signature on the commercial invoice. Consequently, we observe that many documentary credits issued today require a signed commercial invoice and thus effectively modify UCP 600, sub-article 18(a)(iv). The ICC Banking Commission has addressed a query regarding the need to modify a provision to align with the current market practices of a particular country. This official opinion is related to UCP 600, sub-article 38 (k).

UCP 600, sub-article 38 (k)

"Presentation of documents by or on behalf of a second beneficiary must be made to the transferring bank."

The reason for this new provision

According to the commentary of UCP 600, the principal reason for including it was to avoid cases in which the nominated bank at the place to which a documentary credit has been transferred might send the documents to the issuing or any other bank, and by doing so deprive the first beneficiary of the possibility of substituting its invoice (and draft, if any) and drawing for the difference. This new provision reflects standard transferable credit practices that require most transferred credits to include the substitution of documents.

Modification of Sub-Article 38 (k): Bypassing the transferring bank (ICC Official Opinion R653 / TA632rev)

The ICC Banking Commission was asked whether the documents of the second beneficiary must be routed through the transferring bank, in the event of a 100% transfer and no substitution is required from the first beneficiary? Assuming that the transferable credit has no confirmation added.

The analysis in the opinion establishes that when there is a complete (100%) transfer of the credit amount and no substitution is involved, there is no need for the second beneficiary to present their documents to the transferring bank. Then, the opinion moves into two practical situations:

Situation 1: Modification by the transferring bank - This situation arises when the issuing bank has little or no knowledge of how to process a transfer. The issuing bank is not in a position to modify sub-article 38 (k). Solution: The transferring bank may, upon request from the first beneficiary, specify in its transfer advice that documents are to be sent directly to the issuing bank (bypassing the transferring bank), with an intimation to the issuing bank.

Situation 2: modification by the issuing bank - The issuing bank is aware that a 100% transfer is taking place. Solution: The issuing bank states in a transferable credit that the documents of the second beneficiary are to be sent directly to it (bypassing the transferring bank). In this case, the transferring bank will only be able to accept instructions from the first beneficiary that mandate a 100% transfer.

In either of the ways, sub-article 38 (k) is effectively modified.`,
  },
  {
    title:
      'How does the issuing bank honour a complying presentation under a credit available with a nominated bank, but that nominated bank did not act pursuant to its nomination',
    slug: 'how-does-the-issuing-bank-honour-a-complying-presentation-under-a-credit-available-with-a-nominated-bank-but-that-nominated-bank-did-not-act-pursuant-to-its-nomination',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-02-27T23:30:09.968Z',
    content: `A credit can be available with a nominated bank either (a) by payment, or (b) deferred payment, or (c) by acceptance, or (d) by negotiation. The beneficiary presented a complying presentation to the nominated bank, which then decided to forward the documents to the issuing bank (without honour or negotiation). UCP 600, Sub-Article 7 (a) states that "Provided that the stipulated documents are presented to the nominated bank...and that constitute a complying presentation, the issuing bank must honour..." How the issuing bank performs the honour function under the different credit availability with the nominated bank, and that nominated bank does not honour or negotiate, is elaborated below:

Sight payment with the nominated bank, which does not pay -> The issuing bank will "honour" as if the credit is available by payment with it.

Deferred payment with the nominated bank, and that nominated bank does not incur its deferred payment undertaking, or, having incurred its deferred payment undertaking, does not pay at maturity -> The issuing bank will "honour" as if the credit is available by deferred payment with it.

Acceptance with the nominated bank, and that nominated bank does not accept a draft drawn on it or, having accepted a draft drawn on it, does not pay at maturity -> (a) The issuing bank will "honour" as if the credit is available with it by deferred payment [assuming the nominated bank forwarded the documents without a draft or with a draft without endorsement]; (b) The issuing bank will "honour" as if the credit is available with it by acceptance [assuming the nominated bank forwarded the documents with a draft drawn on the issuing bank].

Negotiation with the nominated bank at sight or usance, and that nominated bank does not negotiate -> In case of sight negotiation credit: the issuing bank will "honour" as if the credit is available with it by payment [with or without draft]. In case of usance negotiation credit: the issuing bank will "honour" as if the credit is available with it by acceptance [assuming the nominated bank forwarded the documents with a draft drawn on the issuing bank], or the issuing bank will "honour" as if the credit is available with it by deferred payment [assuming the nominated bank forwarded the documents without a draft drawn on the issuing bank].`,
  },
  {
    title: '"International Standard Banking Practice"-what it actually means',
    slug: 'meaning-of-international-standard-banking-practice',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2025-12-20T04:11:06.041Z',
    content: `"International Standard Banking Practice", as outlined in UCP 600, Article 2, definition of "Complying Presentation" is a dynamic, broad, and flexible concept. It continuously evolves and derives from various sources, including official opinions from the ICC Banking Commission, DOCDEX decisions, and court rulings, among others.

Are all "International Standard Banking Practice" written or codified somewhere in the world? The short answer is "No". While written records primarily drive the evolution of documentary credit practices, experiences also play a crucial role in the addition, deletion, or modification of documentary credit standards.

These practices stem from everyday activities related to documentary credits, reflecting how the commercial parties prepare their documents, changes in shipping and insurance industry practices, and the issuance of various documents by other stakeholders. International Standard Banking Practice adopts a multi-dimensional approach. They not only introduce new practices but also replace outdated ones as the industry evolves. Moreover, older standard practices may also be obsolete if they become infrequent. Furthermore, some practices are so deeply rooted in the documentary credit practices that they become part of the rules.

The broad perspective of International Standard Banking Practice is rightly mentioned in the Introduction of ISBP 745 that "No single publication can anticipate all the terms or the documents that may be used in connection with documentary credits or their interpretation under UCP 600 and the standard practice it reflects..." Practitioners should not confuse "International Standard Banking Practice" with ISBP 821. The concept of International Standard Banking Practice is a much broader concept than ISBP 821. The ISBP is, however, an invaluable component and an essential part of International Standard Banking Practice.`,
  },
  {
    title:
      'A special look into the evolution of the definition of the term "Negotiation"',
    slug: 'a-special-look-into-the-evolution-of-the-definition-of-the-term-negotiation',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-03-27T17:51:02.259Z',
    content: `During the Drafting of UCP 400 [1983]

Even after the request of ICC's National Committees for formal definitions of some frequently used terms in the rules, including the term "negotiation", the UCP 1983 Revision Party was unable to provide definitions acceptable to the Banking Commission [Case no. 13, Case Studies on Documentary Credits (UCP 400)].

During the drafting of UCP 500 [1993]

Ten years later, the Drafting Group of the UCP 500 was also asked by various ICC national committees to define certain terms in the rules. Despite considerable effort, the Banking Commission finally abandoned the attempt except for the term "negotiation" [Documentary Credits: UCP 500 & 400 Compared, Edited by Charles del Busto, at p.7.] UCP 500 Article 10(b)(ii) defined "negotiation": "the giving of value for Draft(s) and/or document(s) by the bank authorised to negotiate".

During the lifetime of UCP 500

This attempt ultimately proved inadequate, necessitating a "Position Paper", which pointed out that: "The Banking Commission notes with regret that, notwithstanding the clear definition contained in the above sub-article, a number of banks fail to understand the meaning of the term 'negotiation' in connection with the availability of a documentary credit". In this effort to re-establish uniform practices, the Banking Commission sought to clarify the meaning of "giving of value" as either 'making immediate payment' (e.g. by cash, by cheque, by remittance through a clearing system or by credit to an account) or 'undertaking an obligation to make payment' (other than giving a deferred payment undertaking or accepting draft).

During the drafting of UCP 600 (2007)

The Drafting Group of the UCP 600 took into consideration this "Position Paper" while re-defining the term "negotiation" in UCP600 article 2 as: "...the purchase by the nominated bank of drafts (drawn on a bank other than the nominated bank) and/or documents under a complying presentation, by advancing or agreeing to advance funds to the beneficiary on or before the banking day on which reimbursement is due to the nominated bank".`,
  },
  {
    title: 'Why is confirmation necessary?',
    slug: 'why-is-confirmation-necessary',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2026-01-02T18:02:27.071Z',
    content: `Introduction

In a documentary credit transaction, the beneficiary assumes credit, operational, and country risk of the issuing bank. When the beneficiary is not comfortable -or unwilling to- with the undertaking of the issuing bank, and wants to hedge associated risks, it uses the technique of adding confirmation.

While standard literature suggests that confirmation serves as a risk management technique for beneficiaries by transferring the credit and country risk of the issuing bank to a more favorable country, in practice, this may not be the sole reason. The confirmation requirement may also not be the requirement of the beneficiary, but rather that of the bank.

Factors that influence adding confirmation to the credit

From the beneficiary's perspective, the need for adding confirmation to a credit depends on a host of factors, including but not limited to:

(a) Hedging the country risk of an issuing bank - The associated risks typically arise from the country's economic and political environment. The beneficiary feels uncomfortable about the unstable political and economic conditions in the country, as these factors directly affect the issuing bank's ability to honor a complying presentation.

(b) Hedging the risk of the issuing bank - The beneficiary might be at ease with the country risk associated with the issuing bank but may not want to assume the credit risk or document risk (such as the potential for spurious discrepancies due to past experiences).

(c) Internal policy of the beneficiary - Beneficiaries may have an internal policy of adding confirmation to all their export documentary credits from a particular country or a region, especially when a country's international credit rating falls below their acceptable threshold.

(d) Availing trade finance facilities for a specific bank - The beneficiary may need to request confirmation to be added to their export documentary credit to access a trade finance facility from a specific bank. Particularly, the financing bank considers the future proceeds of the credit as acceptable collateral. When the issuing bank lacks an international credit rating or its credit rating is below the acceptable threshold of the financing bank, the financing bank may demand confirmation of the credit.

(e) Offer suppliers' credit - The beneficiary may agree to offer suppliers credit to the applicant, provided that the documentary credit is confirmed by a bank acceptable to the beneficiary.

Double assurance of payment to the beneficiary

When adding confirmation to a credit, it means that the beneficiary operates under two separate undertakings from both the confirming bank and the issuing bank. In that sense, the confirmation provides double assurance of payment to the beneficiary.

Independent undertaking of the confirming bank - When the beneficiary presents a complying presentation to the confirming bank, the confirming bank must honour or negotiate (without recourse). The confirming bank's honor or negotiation is separate from the confirming bank's right to seek reimbursement from the issuing bank.

Independent undertaking of the issuing bank - When the beneficiary presents a complying presentation directly to the issuing bank, bypassing the confirming bank (although not recommended), the issuing bank must honour the presentation.`,
  },
  {
    title:
      'The impact of the banking day in a documentary credit subject to UCP 600',
    slug: 'the-impact-of-the-banking-day-in-a-documentary-credit-subject-to-ucp-600',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2025-11-15T04:01:44.287Z',
    content: `How many banking days are allowed for the examination of documents? The answer is a maximum of five banking days following the day of the presentation. While this answer is accurate according to UCP 600, sub-article 14(b), considering this sub-article in isolation does not fully capture the complete impact of banking days in everyday documentary credit operations. The practitioners should read the definition of the term "Banking Day" with the given context, not in isolation.

The term "banking day" is used in UCP 600 in at least three different contexts:

1. To identify "the maximum period of time" permitted for examination of the documents. UCP 600, sub-article 14 (b) says that "A nominated bank acting on its nomination, a confirming bank, if any, and the issuing bank shall each have a maximum of five banking days following the day of presentation..."

2. To calculate "the close of the fifth banking day" as the last day for serving a notice of refusal. UCP 600, sub-article 16 (d) says that "The notice required in sub-article 16 (c) must be given by telecommunication or, if that is not possible, by other expeditious means no later than the close of the fifth banking day following the day of presentation."

3. To allow the beneficiary to make a presentation on the next banking days that are extended due to the last day of presentation or the expiry date falling on a non-banking day. UCP 600, sub-article 29 (a) says that "If the expiry date of a credit or the last day for presentation falls on a day when the bank to which presentation is to be made is closed for reasons other than those referred to in article 36, the expiry date or the last day for presentation, as the case may be, will be extended to the first following banking day."`,
  },
  {
    title: 'Are all the second advising banks referred to as advising banks?',
    slug: 'are-all-the-second-advising-banks-termed-as-advising-banks',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2025-10-11T01:28:48.101Z',
    content: `Before we address the question, it's essential to understand the definition of an advising bank. According to UCP 600, Article 2, an "advising bank" is defined as "the bank that advises the credit at the request of the issuing bank." This definition includes two key components: a) A request from the issuing bank for another bank to advise the credit, and b) The action of the requested advising bank in advising the credit. Both of these conditions must be fulfilled for a bank to be considered an advising bank.

Let us take a journey with the following examples to elaborate on the question.

Example 1 - Bank IB transmits a credit to Bank AB. The credit stated Bank 2AB as "Advised through bank". Bank AB advises the credit to the beneficiary through Bank 2AB. In this example, Bank 2AB has an indirect request from Bank IB and advises the credit to the beneficiary. The essential conditions, i.e., the request from the issuing bank and advising the credit, are met. Therefore, Bank 2AB is also an advising bank.

Example 2 - Bank IB transmits a credit to Bank AB. The credit stated Bank 2AB as "Advised through bank". Bank AB advises the credit directly to the beneficiary without utilizing the services of Bank 2AB. In this example, Bank 2AB has an indirect request from Bank IB, but it did not advise the credit to the beneficiary. The essential condition, i.e., advising the credit, is not met. Therefore, Bank 2AB is not an advising bank.

Example 3 - Bank IB transmits a credit to Bank AB. Bank AB advises the credit to the beneficiary utilizing the service of Bank 2AB. In this example, Bank 2AB has no request from Bank IB, but advises the credit to the beneficiary on Bank AB's request. Therefore, Bank 2AB is not an advising bank. Since Bank 2AB has no request from the Issuing Bank (Bank IB), it should not be considered an advising bank.

Hence, depending on the context, the second advising bank may or may not be termed as an advising bank.`,
  },
  {
    title: 'The Definition of "Negotiation" Under UCP 600, Article 2, Part 1',
    slug: 'the-definition-of-negotiation-under-ucp-600-article-2',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-04-11T01:38:50.063Z',
    content: `The Definition

"Negotiation means the purchase by the nominated bank of drafts (drawn on a bank other than the nominated bank) and/or documents under a complying presentation, by advancing or agreeing to advance funds to the beneficiary on or before the banking day on which reimbursement is due to the nominated bank."

General Interpretation

Under this type of documentary credit, the issuing bank's engagement is extended to another party, a nominated bank, who may negotiate or purchase the beneficiary's draft/documents presented under the credit.

As explained, the act of negotiation by a nominated bank involves the nominated bank advancing its own funds to the beneficiary anytime on or before reimbursement is due from the issuing bank.

The authorisation of the issuing bank to the nominated bank will be expressly indicated in a credit in language such as "available by negotiation with a nominated bank", and logically, the place for presentation of documents will also be at the counters of that nominated bank.

This definition has two broad elements: draft and/or documents, and under a complying presentation.

Meaning of "draft and/or documents" - The meaning of the expression "draft and/or documents" follows that: a negotiation credit can be with or without a draft - in other words, the "draft requirement" is optional under a credit available by negotiation; a negotiation credit may be (a) only with the requirement of the draft [clean documentary credit], (b) only with the requirement of documents without calling for the "draft", and (c) with the requirement of both the draft and documents. Although the definition of negotiation also anticipated presentation of only a "draft" [as the only document required by the credit], this practice is not common under documentary credit operations. However, when standby letters of credit are issued subject to UCP 600, this practice remains commonplace, particularly for a "direct pay standby".

(The next blog discusses the true meaning of "under a complying presentation" under the definition of "negotiation" in UCP 600, Article 2...)`,
  },
  {
    title: 'Banks are Open on a Weekend or Holiday by Special Order',
    slug: 'banks-are-open-by-special-order',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2025-11-22T01:57:44.265Z',
    content: `Introduction

Banking is considered an essential service in many countries. Competent regulators often require banks to serve a specific purpose, even on weekends or holidays. Hence, it is not uncommon in many countries for banks to be open in a particular jurisdiction on a weekend or holiday by special order or decree. The question often arises whether banks are open in a jurisdiction by a special order or decree on a day that is otherwise a weekend or holiday. Will that day be regarded as a "Banking day"?

Analysis

The answer is not straightforward, as it depends on the details of the order. Let us analyze the situation under UCP 600, Article 2, the definition of "Banking Day". First and foremost, we need to know whether banks are permitted to engage in documentary credit-related activities. Assuming that banking activities are fully allowed, including trade services operations, the final and crucial question is whether banks opened by special order or decree can be considered "regularly open." The term "regularly" is not defined in any official documents of the ICC Banking Commission. The lateral meaning of the term "regularly" refers to any scheduled day when banks are open. However, the legal definition of the term "regularly" refers to an event that consistently and repeatedly occurs at a regular interval. It means a frequency that is more than an occasional or one-off event. Hence, when a bank opens on a weekend or holiday by a special one-off order or decree, it should not be considered as a banking day for the purpose of UCP 600.

Final Remarks

It appears that the drafting group for UCP 600 did not anticipate situations where banks in a specific jurisdiction might open on weekends or holidays due to a special order. While these banks may be able to perform functions related to documentary credits on such a day, this day would not be classified as "banking days" since they are not considered "regularly" open. This limitation can disadvantage the beneficiary. In the upcoming revision, the UCP drafting group may want to consider removing the word "regularly" from the definition of "banking day."`,
  },
  {
    title: 'Credit Means Irrevocable: A Historical Perspective',
    slug: 'a-credit-is-irrevocable-even-if-there-is-no-indication-to-that-effect',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-07-09T17:10:04.580Z',
    content: `The evolution of human civilization and trust arguably reflects an inverse relationship, particularly in the context of business. In ancient times, commitment was the cornerstone of commercial relationships-whether expressed verbally or in writing. When financial loss and honoring commitments stood in conflict, preserving trust and fulfilling obligations often prevailed over economic considerations.

This interpretative principle exemplifies how successive revisions of the UCP have consistently aligned with prevailing market practices. The first version, UCP 82 (1933), reflected the then-current practice that documentary credits were classified as either revocable or irrevocable, with revocable credits being the default.

From UCP 82 (1933) through UCP 400 (1984), this provision remained unchanged, mirroring the market reality of that era. However, evolving commercial complexities, increasing global trade risks, and the need for greater certainty gradually reshaped market expectations. This fundamental shift was recognized in UCP 500, where the long-standing presumption changed: documentary credits became irrevocable by default. Eventually, the revocable credit became a matter of history.

In practice, revocable credits under UCP 500 were rarely issued. Recognizing this trend, the drafting group of UCP 600 (2007) eliminated any reference to revocable credits and established that all credits subject to UCP 600 are irrevocable. Accordingly, Article 2 of UCP 600 expressly defines a "Credit means any arrangement, however named or described, that is irrevocable..."

Summary of the evolution across UCP versions: UCP 82 to UCP 400 - credits were of two types (revocable and irrevocable), and credit was revocable unless otherwise expressly stated. UCP 500 - credits were of two types (revocable and irrevocable), and credit was irrevocable unless otherwise expressly stated. UCP 600 - credit means IRREVOCABLE, and credit is IRREVOCABLE.

Although the definition of the term "credit" clearly defines that any credit subject to UCP 600 is irrevocable, should we consider this separate provision in the UCP 600, Article 3, necessary? The answer lies in the long tradition of credit types articulated in successive UCP versions and their gradual evolution. Earlier UCP versions categorized credits into two types-revocable and irrevocable credits. The departure from the tradition was a significant shift. It likely prompted the drafting group of UCP 600 to include a deliberate repetition: a clear reaffirmation that the sole meaning of "credit" under UCP 600 is irrevocable: "A credit is irrevocable even if there is no indication to that effect."`,
  },
  {
    title:
      "Are the terms 'Negotiation' and 'Purchase' synonymous under UCP 600",
    slug: 'are-the-terms-negotiation-and-purchase-synonymous-under-ucp-600',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2026-04-04T04:43:36.792Z',
    content: `Many practitioners today still use the terms 'negotiation' and 'purchase' interchangeably. Let us explore the root cause of the confusion between these terms.

UCP 151 (1951) - The first version of the UCP that introduced the methods of availability - pay, accept, negotiate or purchase [General Provisions, First Paragraph].

UCP 290 (1974) - UCP 290 (1974), Article 3 (iii) used the term purchase/negotiation. During that time, the ICC Banking Commission was requested for an opinion whether under a credit available by 'negotiation', 'purchase' is different from, or the same as, negotiation'. The commission opined that "the effect of 'purchase' and 'negotiate' was the same. [ICC Publication No 371, Page 13].

UCP 400 (1983) - The drafting group of UCP 400 (1983) acknowledged the opinion, and the effect has been given to this view in the redrafted text by the replacement of "purchase/negotiation" by "negotiation" in UCP 400, Article 10 (a)(iv). [UCP 1974/1983 Revisions Compared and Explained by Bernard Wheble, Chairman of the ICC Banking Commission, ICC Publication No. 411, page no. 23]

UCP 500 (1993) - Ten years later, the Drafting Group of the UCP 500 reconsidered the issue to provide acceptable definitions of certain terms in the rules, including 'purchase' and 'negotiation'. Despite considerable effort, the Banking Commission finally abandoned the attempt except for the term "negotiation" [Documentary Credits: UCP 500 & 400 Compared, Edited by Charles del Busto, at p.7.] UCP 500 Article 10(b)(ii) defined "negotiation": "the giving of value for Draft(s) and/or document(s) by the bank authorised to negotiate". Unfortunately, old habits die hard. Many bankers still consider that all purchases are 'negotiation' regardless of the credit availability. The Banking Commission notes with regret that, notwithstanding the clear definition contained in the above sub-article, a number of banks fail to understand the meaning of the term 'negotiation' in connection with the availability of a documentary credit.

UCP 600 (2007) - The drafting group of UCP 600 considered the position paper published during the UCP 500 era to clarify the misunderstanding surrounding the term "negotiation." They redrafted the definition of "negotiation" in Article 2. Additionally, Article 12(b) of UCP 600 explicitly states that a nominated bank is authorized to 'prepay or purchase' under a credit that is available by deferred payment or by acceptance.

Conclusion - From UCP 151 to UCP 400, the terms 'negotiation' and 'purchase' were considered synonymous. However, this position changed during the time of UCP 500, and is further reaffirmed in UCP 600. A nominated bank may negotiate a complying presentation under a credit available with the nominated bank by negotiation. In other words, any "prepay or purchase" on the part of a nominated bank under a credit available by deferred payment or by acceptance is not a negotiation.`,
  },
  {
    title:
      'Meaning of "under a Complying Presentation" in the definition of the "Negotiation"',
    slug: 'meaning-of-under-a-complying-presentationin-the-definition-of-the-negotiation',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2026-04-17T19:02:24.852Z',
    content: `The phrase "under a complying presentation" gives the impression that document compliance is a prerequisite for a nominated bank to be able to negotiate a presentation. However, the definition is silent as to which bank's perspective a presentation must comply as well as its timeframe. There are two important issues to be considered here: complying presentation from which bank's perspective (the nominated bank, the confirming bank, or the issuing bank); and the preclusion rule of UCP 600, i.e., UCP 600 article 16(e).

According to UCP 600, presentations undergo an examination process in different stages of the lifecycle of the documentary credit. The examination process starts following the beneficiary making a presentation of documents to the nominated bank. The nominated bank then makes a presentation to the confirming bank (if the credit is confirmed), and finally, the confirming bank makes a presentation to the issuing bank. Therefore, what may be a complying presentation of documents in the eyes of the beneficiary and a nominated bank, may not be determined as a complying presentation upon examination by the issuing bank and/or the confirming bank [James E. Byrne, The Comparison of UCP 600 & UCP500 18 (IIBLP 2007)].

As a consequence, one cannot conclude whether the presentation of documents is complying in the eyes and determination of all parties. This appears to be the primary reason Professor James E. Byrne mentioned that the linkage of "negotiation" to "under a complying presentation" is "unfortunate" [James E Byrne, The Comparison of UCP 600 & UCP500 36 (IIBLP 2007)].

Furthermore, "Complying presentation" is defined under UCP 600 article 2 as "a presentation that is in accordance with the terms and conditions of the credit, the applicable provisions of these rules and international standard banking practice." One of the important elements in the definition of "complying presentation" is the "applicable provisions of these rules".

Consequently, the term "complying presentation" should be read in context and all provisions of UCP 600 which must be considered as a whole. Even if a presentation does not comply, it may transpire that the documents are effectively complying because of an inadequate and/or untimely notice of refusal by the issuing or confirming bank. In other words, the issuing bank or the confirming bank will be precluded from claiming that a presentation is not complying if the bank fails to act in accordance with the provision of UCP 600 article 16(c). This applies even if the documents include a clear discrepancy.

Hence, when read in context, the complying presentation "test" for negotiation by a nominated bank should be read in conjunction with the "preclusion rule" as stipulated in UCP 600, Article 16 (f).`,
  },
  {
    title: 'Decoding the Definition of "Confirmation"',
    slug: 'decoding-the-definition-of-confirmation',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-01-10T13:03:37.639Z',
    content: `"Confirmation means a definite undertaking of the confirming bank, in addition to that of the issuing bank, to honour or negotiate a complying presentation."

General Interpretation

The "Confirmation" definition as articulated in UCP 600, Article 2, should be read in conjunction with the definition of "Credit". The definition of credit includes the core attributes of a credit, however named or described: (a) an irrevocable, and (b) a definite undertaking of the issuing bank. When another bank adds confirmation to a credit, either upon authorization or at the request of the issuing bank, it creates a separate but irrevocable and definite undertaking of that bank (the confirming bank).

Meaning of the phrase "in addition to that of the issuing bank"

An issuing bank is irrevocably bound as of the time it issues the credit. When a confirmation adds to that credit, either upon authorization or at the request of the issuing bank, it creates a separate irrevocable obligation from the confirming bank. It means that when the beneficiary presents a complying presentation to the confirming bank, its honour or negotiation must not depend on receiving reimbursement from the issuing bank. This separation of undertaking between the issuing bank and confirming parties is defined in UCP 600 as "...in addition to that of the issuing bank."`,
  },
  {
    title: 'A brief history of the "Signature" provision in UCP',
    slug: 'a-brief-history-of-the-signature-provision-in-ucp',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-07-25T08:23:24.428Z',
    content: `From UCP 82 (1933) through UCP 400 (1983), the UCP contained no provisions governing how a document was to be signed. This absence reflected the commercial reality of the time, when signature practices were largely uniform and universally accepted, with handwritten and stamped signatures serving as the standard methods.

The advent of computer technology and electronic communications - and their widespread adoption - introduced a wide range of new authentication methods, necessitating greater clarity within the UCP framework. UCP 500 (1993), sub-article 20(b), responded to this commercial evolution by broadening the scope of acceptable signatures to include those executed or adopted by handwriting, facsimile, perforation, stamp, symbol, or any other mechanical or electronic method of authentication.

Notably, UCP 500 took a deliberately liberal approach in defining what constitutes a signature. As stated in Documentary Credits: UCP 500/400 Compared (ICC Publication No. 511), any symbol executed or adopted by a party with the intention to authenticate a writing should be accepted as a valid signature.

UCP 600 (2007) preserves this approach in Article 3, paragraph 3: "A document may be signed by handwriting, facsimile signature, perforated signature, stamp, symbol or any other mechanical or electronic method of authentication."

While the underlying provisions of UCP 500 and UCP 600 remain substantively unchanged, their practical application has evolved considerably. Traditional signature methods - handwritten, perforated, stamped, or symbol-based - have largely given way to mechanical and electronic authentication, mirroring the accelerating digitalization of international trade and banking operations.`,
  },
  {
    title: 'ISBP- from where it came and where it stands now',
    slug: 'isbp--from-where-it-came-and-where-it-stands-now',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2025-12-27T05:51:34.906Z',
    content: `Before the UCP

The term "Standard Practice" in connection with the examination of documents under a documentary credit was first used even before the birth of the first UCP. In fact, it first appeared in the "Regulations Affecting Export Commercial Credits" published in New York in 1920.

First Reference to the UCP 500 (1993)

Seventy-three years later, UCP-500 (1993) was first referenced to "International Standard Banking Practice" in its Sub-Article 13 (a): "...Compliance of the stipulated documents on their face with the terms and conditions of the Credit, shall be determined by international standard banking practice as reflected in these Articles..."

The First ISBP: ISBP 645 (2002)

During this period, the ICC Banking Commission noted that examination standards differ significantly between banks, resulting in a higher rate of discrepancies upon first presentation. Furthermore, many of the discrepancies identified were unfounded. The Banking Commission recognized the need for a single publication to compile uniform standards for the examination of documents. Additionally, there was a publication titled "Standard Banking Practices for the Examination of Documents (SBPED)" that was endorsed by the US Council on International Banking and the Mexican Bankers Association. Following this, the ICC Banking Commission chose to expand this publication into a global agreement under the banner of the International Chamber of Commerce (ICC). Consequently, a new publication, "International Standard Banking Practice (ISBP) for the Examination of Documents under Documentary Credits," ICC Publication No. 645, was introduced in 2002. The purpose of the ISBP is to reduce discrepancies in documents by establishing uniform practices worldwide. Since its introduction, the ISBP has become an essential companion to the UCP rules for all professionals dealing with documentary credits.

ISBP 681 (An updated version of ISBP 645)

After the implementation of UCP 600, it became necessary to align the content of the ISBP with the new rules. Consequently, a new updated ISBP 681 was introduced in the same year as the UCP 600 came into force. The ISBP 681 was an updated version of the former ISBP 645, primarily to reflect the substance and style of the new UCP 600 rules. As a result, the content of ISBP 681 is largely similar to that of ISBP 645, with only a few minor deletions.

First Formal Revision of ISBP: ISBP 745

In November 2009, the ICC Banking Commission decided to initiate a comprehensive revision of the ISBP 681. Subsequently, a drafting group was formed in February 2010. The revision process took more than three years to prepare a draft version of the revised ISBP, which was presented for approval at the ICC Banking Commission Meeting in Lisbon on April 17, 2013. Finally, the ICC Banking Commission approved the new ISBP with a vote of 87 to 1. The new ISBP was published under the ICC publication number 745.

Review of ISBP 745 (ISBP 821)

Reasons for the limited review of ISBP 745 were articulated in the introduction part of ISBP 821: "As announced at the Plenary Meeting in Paris on 20 October 2022, the Banking Commission SteerCo, in response to feedback from National Committees, established a Working Group in order to initiate a limited review of the ISBP 745. The aim was to evaluate all ICC Opinions approved since the release of the ISBP 745 and to ensure that the ISBP was fully aligned with their content." Therefore, this review merely ensured alignment between previously approved texts and allowed for all relevant material to be contained in a single publication. The outcome of the alignment review resulted in nine Opinions being recognised as containing content that would be meaningful for addition within the ISBP.`,
  },
  {
    title: 'The Interpretation of the term "Banking Day"',
    slug: 'the-interpretation-of-the-term-banking-day',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2025-11-08T01:47:51.052Z',
    content: `Definition

Banking day means a day on which a bank is regularly open at the place at which an act subject to these rules is to be performed.

General Interpretation

The definition starts with the root element that banking day means a day (calendar day)... It means that any calendar day is to be considered as a banking day provided that it fulfills the following two conditions: (a) A day on which a bank is regularly open, and (b) At the place at which an act subject to these rules is to be performed.

(a) Regularly open - This part of the definition has one key element: regularly open. It aims to exclude weekends and holidays from what constitutes a "Banking Day." In other words, a "Banking Day" is defined as any calendar day on which the bank is scheduled to be open. Additionally, banks are not required to operate for full banking hours. Even if they are open for only half a day, they still qualify as regularly open.

(b) At the place at which an act subject to these rules is to be performed - This part of the definition has two distinctive elements: "At the place", and "an act subject to these rules is to be performed". "At the place" emphasizes that the Banking Day applies to the location where documents are presented, rather than to all other banks in the chain simultaneously, at any given time. "An act subject to these rules is to be performed" emphasizes that a bank may be open for regular banking activities on a scheduled day to perform documentary credits-related activities.

For example, if a bank is regularly open on Saturdays for half a day to accept deposits and open accounts, those Saturdays are considered regular banking days. However, since the trade services division is not open on Saturdays, activities related to documentary credits cannot be performed. Therefore, these Saturdays should not be considered banking days according to UCP 600.`,
  },
  {
    title:
      'Key Attributes of the term "Credit" according to UCP 600, Article 2',
    slug: 'key-attributes-of-credit-according-to-ucp-600-article-2',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-02-14T05:12:27.464Z',
    content: `The Provision

UCP 600, Article 2 defines the term Credit as any arrangement, however named or described, that is irrevocable and thereby constitutes a definite undertaking of the issuing bank to honour a complying presentation.

Key Elements of the Definition

This definition contains the following key elements: any arrangement, however named or described; irrevocable; a definite undertaking of the issuing bank; honour a complying presentation.

Interpretation of Each Key Element

(a) Any arrangement, however named or described - A credit is known by various colloquial names, including but not limited to "letters of credit," "commercial letters of credit," "documentary credits," "standby letters of credit," and simply "standby." These titles may appear in the heading of the instrument or within its text. The phrase "Any arrangement, however named or described..." highlights that these titles or descriptions, even if included in the credit, are of lesser significance and do not affect the validity or function of the document.

(b) Irrevocability - This attribute dispels the concept of revocable documentary credit from the documentary credit operations subject to UCP 600. Now, any documentary credit issued subject to UCP 600 is irrevocable even if there is no indication to that effect. What is the impact of irrevocability in documentary credits operations? It signifies that a credit, once issued, can neither be amended nor cancelled without the agreement of the issuing bank, the confirming bank, if any, and the beneficiary.

(c) A definite undertaking of the issuing bank - A credit is a definite undertaking of the issuing bank in the sense that the text of the credit must be precise, such as, but not limited to: the undertaking must run to a named beneficiary; the amount of the credit is fixed and must be determinable from the text of the credit; etc.

(d) To honour a complying presentation - The essence of this part of the definition is that the issuing bank is obligated to honour a complying presentation.`,
  },
  {
    title: 'The Definition of "Honour" under UCP 600, Article 2',
    slug: 'the-definition-of-honour-under-ucp-600-article-2',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-02-21T07:53:32.504Z',
    content: `The term "honour" is defined in UCP 600, Article 2, which outlines three types of credit availability: (a) by payment, (b) by deferred payment, and (c) by acceptance.

(a) By payment: the bank pays at sight under a complying presentation made by the beneficiary. (b) By deferred payment: the bank incurs a deferred payment undertaking, and pays at maturity under a complying presentation made by the beneficiary. (c) By acceptance: the bank accepts the draft and pays at maturity under a complying presentation made by the beneficiary.

These types of credit availability are referred to in UCP 600 as the credit "available by". In this context, "available by" signifies the means or methods through which a credit is available for payment. The above definition mainly explains the "honour" function solely focuses on a credit "available by". However, the credit 'available by' must be associated with a bank-this includes the nominated bank, confirming bank (if any), and the issuing bank. "Available with" is the term used in UCP 600 to denote the bank with which a credit is available (available by) for presentation.

It should be noted that the nominated bank has no independent undertaking to the credit. Hence, it has no obligation to honour a complying presentation except when expressly agreed to by that nominated bank and so communicated to the beneficiary. We assume that the nominated bank acted on its nomination [emphasis added]. The issuing bank and the confirming bank, if any, have an independent undertaking to the credit. It means that the issuing bank and the confirming bank, if any, must honour a complying presentation made by the beneficiary.

Against these backdrops, honouring a complying presentation means: (a) must pay at sight under a complying presentation made by the beneficiary, if the credit is available with the nominated bank, or the confirming bank (if any), or the issuing bank, by payment; (b) must incur a deferred payment undertaking and pay at maturity under a complying presentation made by the beneficiary, if the credit is available with the nominated bank, or the confirming bank (if any), or the issuing bank, by deferred payment; (c) must accept a draft and pay at maturity under a complying presentation made by the beneficiary, if the credit is available with the nominated bank, or the confirming bank (if any), or the issuing bank, by acceptance.`,
  },
  {
    title: 'How to Negotiate, Part one: Advancing Fund',
    slug: 'how-to-negotiate-part-one-advancing-fund',
    category: 'UCP',
    readingTime: 1,
    publishedAt: '2026-05-09T03:09:37.712Z',
    content: `Introduction

Take, for example, a nominated bank that has decided to act pursuant to its nomination under a credit available by negotiation. The nominated bank expressly communicated its willingness to negotiate with the beneficiary in advance of the time of presentation of documents. Then, as communicated, the nominated bank purchases the bill under a complying presentation. This is a common way to negotiate.

According to the wording of the definition of "negotiation" in UCP 600 article 2, there are two approaches to purchase (negotiate), i.e., (a) advancing funds and (b) agreeing to advance funds.

(a) Advancing funds - Advancing funds to the beneficiary is self-descriptive, which simply means the nominated bank advances money (e.g., by cash, by cheque, by remittance through a clearing system, or by credit to an account). To do this, the nominated bank creates an advance or loan on its own books and advances the funds to the beneficiary in anticipation of reimbursement from the issuing bank.`,
  },
  {
    title:
      'The Nominated Bank, a trusted intermediary between the issuing bank and the beneficiary',
    slug: 'the-nominated-bank-a-trusted-intermediary-between-the-issuing-bank-and-the-beneficiary',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-05-29T18:24:26.547Z',
    content: `The nominated bank serves as a trusted intermediary between the issuing bank and the beneficiary without assuming any independent undertaking. Acting as a trusted intermediary, the nominated bank facilitates a presentation and sometimes extends trade finance as follows:

(a) Accepts the Beneficiary's Presentation - When the beneficiary presents the documents to a nominated bank within the expiry date and/or the last day for presentation, this presentation effectively triggers the issuing bank's undertaking to honour, irrespective of whether the documents physically reach the issuing bank before or after the expiry date [Reference: UCP 600, Sub-Article 7(a)].

(b) Facilitate Trade Finance - The nominated bank may offer trade finance to the beneficiary in accordance with the availability of the credit [Reference: UCP 600, Article 2 (Definition of "Negotiation") and Sub-Article 12(b)].

(c) Facilitate a Presentation on an Extended Banking Day - If the last day for presentation falls on a day when the nominated bank is closed for reasons other than those referred to in Article 36 (force majeure), the last date of presentation is extended to the first following banking day. A statement on the covering schedule in this regard is sufficient evidence of compliance with this rule [Reference: UCP 600, Sub-Article 29(a) and 29(b)].

(d) Protect the Proceeds of the Beneficiary Even When a Complying Presentation is Lost in Transit - When a complying presentation is lost in transit between the nominated bank and the issuing bank, the issuing bank is obligated to honour the presentation [Reference: UCP 600, Sub-Article 35, Paragraph 2].

(e) Acting as a Transferring Bank - The nominated bank may act as a transferring bank under a transferable credit upon authorization received from the issuing bank [Reference: UCP 600, Sub-Article 38(b)].`,
  },
  {
    title: 'Credit Means Irrevocable, Part 2',
    slug: 'credit-means-irrevocable-part-1',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-07-17T18:19:18.731Z',
    content: `Commercial certainty is the cornerstone of every documentary credit. Once a beneficiary ships goods in reliance on a credit, it must be able to trust that the issuing bank cannot simply revoke its undertaking. This is the principle of irrevocability embodied in Article 3, paragraph 2, of UCP 600, which provides that every credit issued subject to the UCP is irrevocable - irrespective of whether it expressly states so, since irrevocability is one of the inherent features of every credit issued subject to UCP 600.

Let's explore a few key provisions that apply the irrevocable principle practically in day-to-day documentary credit operations.

Except as provided in Article 38 of UCP 600, a credit can neither be amended nor cancelled without the agreement of the issuing bank, the confirming bank (if any), and the beneficiary, as stipulated in UCP 600 Sub-Article 10(a). This reinforces the fundamental principle of irrevocability: once a credit is issued, the issuing bank's undertaking remains binding and enforceable. The issuing bank cannot unilaterally modify or withdraw its commitment without obtaining the consent of all relevant parties.

The opening phrase of Sub-Article 10(a), "Except as provided in Article 38," primarily refers to UCP 600 Sub-Article 38(f), which addresses amendments under transferred credits. In the case of a transferred credit involving multiple second beneficiaries, each second beneficiary independently retains the right to accept or reject an amendment. The acceptance or rejection of an amendment by one second beneficiary does not affect or prejudice the rights of any other second beneficiary in relation to the portion of the credit transferred in their favour.

Taken together, these rules show why irrevocability is more than a formal label - it's an operational guarantee that holds firm across amendments, cancellations, and even multi-party transfer structures, giving every party in the chain a stable, predictable, and enforceable position.`,
  },
  {
    title:
      'Must the confirmation be identical to the original credit conditions?',
    slug: 'must-the-confirmation-be-identical-to-the-original-credit-conditions',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-01-16T18:23:26.236Z',
    content: `Although confirmation to the credit denotes a separate confirming bank's undertaking in addition to the undertaking of the issuing bank, these two undertakings need not be identical. The confirming bank may impose additional conditions in its confirmation advice or insert additional conditions to the credit, or agree to add confirmation for a lesser amount than the original credit.

Example 1 - A credit issued for USD100 for the import of a brand new sewing capital machinery for the readymade garments industry under the following conditions: partial shipment prohibited; 90% of the credit amount will be paid on a credit compliant presentation; and the final 10% will be paid on receipt of the certificate issued by the applicant confirming that the machine has been installed successfully. The confirming bank may be willing to add confirmation to the credit only up to 90% of the credit amount.

Example 2 - A credit issued for the import of 100 MT wheat @ USD 2.00 per MT, total amount USD 200, under the following conditions: partial shipment allowed; credit available by payment with the confirming bank; payment will be made upon receipt of credit-compliant documents; the confirming bank has only a USD100 credit line available with the issuing bank; the beneficiary agrees to a partial confirmation of the credit amount, specifically USD 100, which pertains to the intended first shipment; the remaining credit amount of USD 100 will be confirmed after the beneficiary receives a payment of USD 100 (the first drawing) from the issuing bank; confirmation added to the credit for USD 100.00; confirming banks will add confirmation for the remaining amount.

However, proposed additional conditions must not deviate from the confirming bank's independent undertaking, and erode the core attributes, such as the irrevocable and definite undertaking of the original credit.`,
  },
  {
    title: 'The definition of the "Credit"- a basic (narrow) approach',
    slug: 'the-definition-of-the-credit--a-basic-narrow-approach',
    category: 'UCP',
    readingTime: 1,
    publishedAt: '2026-02-07T04:38:31.840Z',
    content: `Credit means any arrangement, however named or described, that is irrevocable and thereby constitutes a definite undertaking of the issuing bank to honour a complying presentation.

UCP 600, Article 2, provides a narrow definition of the term "credit," focusing on the primary parties involved, namely, the issuing bank and the beneficiary. It states that a credit is an arrangement between the issuing bank and the beneficiary in which the issuing bank undertakes to honour a complying presentation made by the beneficiary. This definition includes the following key elements: any arrangement, regardless of how it is named or described; irrevocability; a definite commitment from the issuing bank; the obligation to honor a complying presentation.

Although not covered in the definition of "credit," some obligations that arise from the credit share similar characteristics. One example is a confirmed credit. In a confirmed credit, the confirming bank has a separate obligation to honor or negotiate (without recourse) a complying presentation. This type of undertaking is also irrevocable, definitive, and independent of the issuing bank's undertaking to the beneficiary. It is in that sense that the definition of the credit follows a basic (narrow) approach.`,
  },
  {
    title: 'The definition of "Presenter"',
    slug: 'the-definition-of-presenter',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-06-20T04:24:39.301Z',
    content: `The term "Presenter" is defined in UCP 600, Article 2 as follows: "Presenter means a beneficiary, bank or other party that makes a presentation"

Considering the maximum documents flow in a documentary credit chain, we can broadly analyze the definition of the term "presenter" in the following two parameters:

(1) The starting point - There are possibly the following three situations observed in practice: (a) when the beneficiary submits documents to the nominated bank or directly to the issuing bank, the beneficiary is regarded as the presenter; (b) in some cases, the beneficiary may deliver the documents to its bank (a non-nominated bank, or collecting bank), which then forwards them to the nominated bank or directly to the issuing bank - in this situation, this non-nominated bank assumes the role of presenter; (c) sometimes, a freight forwarder may act on behalf of the beneficiary, presenting the documents to the nominated bank or to the issuing bank as a presenter. The beneficiary is not the presenter in points (b) and (c). UCP 600, Article 2, denotes the non-nominated bank (collecting bank) or the freight forwarder as "other party".

(2) Presenters in the middle of the chain - Once the nominated bank receives the documents, it may forward the documents to the confirming bank. The confirming bank then forwards the documents to the issuing bank. At this point, both the nominated bank and the confirming bank act as presenters. UCP 600, Article 2, used the common term "bank" to cover the presenters in the middle of the chain.

(3) The Issuing Bank as a Presenter - The chain of presentation comes to an end once the issuing bank receives the documents. Any subsequent handling of the documents between the issuing bank and the applicant falls outside the scope of UCP 600. Consequently, the issuing bank, notwithstanding its possession and handling of the documents, cannot be regarded as a "Presenter" within the meaning of Article 2.`,
  },
  {
    title: 'The Definition of "Beneficiary"',
    slug: 'the-definition-of-beneficiary',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2025-11-29T01:13:13.603Z',
    content: `UCP 600, Article 2

"Beneficiary" means the party in whose favour a credit is issued.

General Interpretation

UCP 600 is the first version of the UCP that formally defines the term "Beneficiary". In general, a documentary credit involves at least two parties: (a) the issuing bank, and (b) the beneficiary. The first party, i.e., the issuing bank, is the issuer of the documentary credit, and the second party, i.e., the beneficiary, is the party in whose favor the undertaking is issued. This definition of UCP 600 has two key elements: (a) the party (in whose favor), and (b) a credit is issued.

(a) The party in whose favor - Should a documentary credit be issued solely in favor of a single named beneficiary, or can it also be issued in favor of multiple beneficiaries? The use of documentary credits predates the introduction of the first version of the Uniform Customs and Practice for Documentary Credits (UCP). Henry Harfield has traced the history of documentary credits issued in favor of more than one beneficiary. He wrote in his book "Bank Credits and Acceptances", fifth edition (1974), page no. 179 that "In the development of the letter of credit device, distinctions were made as between general and special letters. The general letter was one intended to induce reliance by any person to whom it was presented. The special letter was addressed to a particular person, and the obligation of the writer was confined to the addressee. With the development of the bank credit as a substitute for the earlier mercantile credit..., the general letter of credit virtually dropped out of use, re-emerging ultimately as the modern traveler's letter of credit. The current form of commercial letter of credit, typically a bank credit and most frequently a documentary credit, is, therefore, an outgrowth of the old special letter of credit." Hence, modern-day documentary credits are issued only in favor of a named beneficiary.

(b) A documentary credit is issued - Almost all documentary credits issued today use the SWIFT message system. In a typical MT 700 message, the issuing bank's name appears at the top of the message. The issuing bank incorporates its terms and conditions within various designated fields and directs the undertaking to a specific beneficiary mentioned in field 59.`,
  },
  {
    title: 'The definition "issuing bank" under UCP 600, Article 2',
    slug: 'the-definition-issuing-bank-under-ucp-600-article-2',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-03-07T04:25:37.075Z',
    content: `The Definition

The term "issuing bank" is defined in UCP 600, Article 2 as the bank that issues a credit at the request of an applicant or on its own behalf.

Brief History

UCP 82 (1933): The term Issuing Bank first appeared in UCP, but it did not define the term. UCP 290 (1974): General provisions and definition (d) provided a parenthetical definition of the term Issuing Bank. UCP 500 (1993): The first formal recognition that the Issuing Bank can issue a credit on its own behalf in addition to acting at the request and on the instruction of the applicant. UCP 600: Article 2 provides the first formal definition of the term Issuing Bank.

Interpretation of the Rule

The term "issuing bank" is defined in UCP 600, Article 2, from the perspective of the issuance of the credit. This definition is to be read in conjunction with UCP 600, Sub-Article 7(b), which states, "An issuing bank is irrevocably bound to honour as of the time it issues the credit." Considering these two references together, we observe that this definition specifies the exact point in time at which the issuing bank is obligated to its own undertaking. Although the term "issue" is not explicitly defined in UCP 600, international standard banking practice generally holds that a credit is issued when it leaves the issuing bank's operational control. This typically refers to the moment when the issuing bank transmits the credit from its SWIFT system. Hence, any request to amend or cancel subsequent to issuance of a credit is subject to the beneficiary's consent, even if the credit has not yet been advised to the beneficiary according to ICC Official Opinion TA 475.

This definition also addresses the situation where the issuing bank typically issues a credit at the applicant's request. However, in rare instances, the issuing bank may issue a credit on its own behalf. In such a case, the issuing bank functions in two independent roles simultaneously: (a) as the applicant for the credit and (b) as the issuer of the credit.`,
  },
  {
    title:
      'Does Every Document Presented Under a UCP 600 Credit Require a Signature?',
    slug: 'does-every-document-presented-under-a-ucp-600-credit-require-a-signature',
    category: 'UCP',
    readingTime: 4,
    publishedAt: '2026-08-02T10:21:53.702Z',
    content: `Not all documents presented under a credit subject to UCP 600 require a signature. Whether a document must be signed depends on the applicable provisions of UCP 600, the International Standard Banking Practice, and any express requirement contained in the credit.

This blog examines the signature requirements for documents presented under UCP 600 by classifying them into two categories: (a) by default, as guided by UCP 600 and international standard banking practice; (b) by express indication in the credit condition.

(a) By default (Even when Credit does not stipulate): UCP 600 and standard practice

UCP 600 adopts a document-specific approach by prescribing separate rules for three principal categories of documents: commercial invoices (Article 18), transport documents (Articles 19-25), and insurance documents (Article 28). All documents falling outside these categories are governed by the general provisions of Sub-Article 14(f). Accordingly, documents required under a credit subject to UCP 600 may be classified into four categories: commercial invoice; transport documents; insurance documents; other documents.

From a signature perspective, these documents fall into two broad classes: (i) documents that require a signature by default under UCP 600 [applicable UCP 600 provisions]; (ii) documents that require a signature by default under established practice [standard practice].

(i) Applicable UCP 600 provision - The dedicated articles of UCP 600 dealing with commercial invoices, transport documents, and insurance documents expressly address their respective signature requirements: Commercial Invoice - a commercial invoice need not be signed, unless the credit requires a signature (UCP 600, Sub-Article 18(a)(iv)); Transport Documents - a transport document, however named, must appear to be signed, this requirement applies to each type of transport documents governed by Articles 19-25, for example, a bill of lading must appear to be signed in accordance with Sub-Article 20(a)(i); Insurance Documents - an insurance document must appear to be issued and signed (UCP 600, Sub-Article 28(a)).

The position is different for other documents governed by Sub-Article 14(f). UCP 600 does not prescribe a general signature requirement for such documents. Whether a signature is required depends on either the express terms of the credit, or the international standard banking practice, where a signature is necessary for the document to fulfil its intended function.

(ii) Standard practice - One of the most authoritative publications on the application of the international standard banking practice is ISBP 821. It provides practical guidance issued by the ICC Banking Commission on the examination of documents under UCP 600, including circumstances in which a signature is expected even though UCP 600 does not expressly prescribe one. Examples include (the list is illustrative, not exhaustive): Certificates, Declarations, and Statements - any document presented in the form of a certificate, declaration, or statement must be signed, this requirement also applies to any certification appearing on a required document [ISBP 821, Paragraph A3]; Draft (Bill of Exchange) - a draft must be drawn and signed by the beneficiary [ISBP 821, Paragraph B8]; Certificate of Origin - a certificate of origin must be signed by the party required to issue it [ISBP 821, Paragraph L1]. In practice, an issuer may consolidate multiple certificates, declarations, or statements (certificates) into a single document. In such circumstances, a single signature on the consolidated certificate satisfies the signature requirement for each certification incorporated therein.

(b) By express indication in the credit condition

Where a credit expressly requires a document to be signed, the document must bear the required signature. Such a requirement may be incorporated into the credit as a modification of the default position under UCP 600. For example, Sub-Article 18(a)(iv) of UCP 600 provides that a commercial invoice need not be signed. However, if the credit expressly requires a signed commercial invoice, the beneficiary must comply with that requirement.

Conclusion

In summary, the absence of a signature is not, by itself, a discrepancy under UCP 600. A document must be signed only where the applicable UCP provision, the International Standard Banking Practice, or the credit itself requires one.`,
  },
  {
    title:
      'Why does UCP use the term bank despite non-bank entities that could also act as an issuer, confirmer, advisor, or nominated person?',
    slug: 'why-does-ucp-use-the-term-bank-despite-non-bank-entities-that-could-also-act-as-an-issuer-confirmer-advisor-or-nominated-person',
    category: 'UCP',
    readingTime: 1,
    publishedAt: '2026-03-21T17:52:54.351Z',
    content: `The ICC Banking Commission explained the reason for using the term "bank" after the issuing, confirming, advising, or nominated during the time of UCP 500 through its official opinion R 505/ TA537 (1995-2004) as follows:

Although there is no restriction in the UCP prohibiting entities that are not banks from issuing, confirming, paying, negotiating, or advising documentary credits, its vocabulary ('issuing bank', 'confirming bank', etc.) assumes that these entities are banks. This assumption is based on the recognition that there are three principal advantages to bank issuance and handling of documentary credits, namely: that banks have the operational expertise to handle issuance and presentation under the credit in a professional manner; that they have the tradition of independence from the underlying transaction, which is the basis of the commercial reputation of the credit; and that in virtually all countries, banks are specially regulated with a view toward protecting those who rely on their undertakings.

The above-mentioned points are important considerations to maintain the credibility of the documentary credits as a lifeblood of international commerce, and maintain the UCP reputation as a living code for the documentary credits business.`,
  },
  {
    title: 'Roles of the Beneficiary under a Documentary Credit',
    slug: 'roles-of-the-beneficiary-under-a-documentary-credit',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2025-12-06T09:30:48.233Z',
    content: `In our training sessions and workshops, we often ask participants what the beneficiary should do after receiving an advised credit that is workable under UCP 600. The most common response is that the beneficiary will arrange for the shipment of goods. However, this answer is not entirely accurate. While shipping the goods is a crucial step for the exporter in accordance with the underlying sales contract, an important task for the beneficiary under a credit is to collect the bill of lading after the shipment. The exporter deals with goods, but the beneficiary deals with documents.

The main responsibility of the beneficiary is clearly articulated in UCP 600, Sub-Article 6 (a), that "Except as provided in sub-article 29 (a), a presentation by or on behalf of the beneficiary must be made on or before the expiry date." Hence, one of the chief roles of the beneficiary is to make a complying presentation. For this to happen, the beneficiary prepares some of the required documents (commercial invoice, beneficiary certificates, etc.) and collects the rest of the required documents (bill of lading, certificate of origin, inspection certificate, etc.), and then collates all documents to present them to the nominated bank or the issuing bank.

The beneficiary also has some other roles to play under documentary credit operations: seeking an amendment to the terms and conditions of the credit; sending a notification of acceptance or rejection of an amendment; paying charges, commission, fees, etc, as per the credit condition; providing disposal instructions for documents to the issuing bank and/or presenter; requesting the transferring bank to transfer a transferable credit to the second beneficiary; substituting the invoice, and the draft, if any, under a transferable credit, when the transferring bank requests, etc.`,
  },
  {
    title: 'The Definition of "Confirming Bank"',
    slug: 'the-definition-of-confirming-bank',
    category: 'UCP',
    readingTime: 3,
    publishedAt: '2026-01-23T18:25:13.669Z',
    content: `Confirming bank means the bank that adds its confirmation to a credit upon the issuing bank's authorization or request.

The definition of the term "Confirming bank" has three distinct elements: the meaning of the word "Add"; the bank that adds its confirmation to a credit; the issuing bank's authorization or request.

Meaning of the word "add"

The phrase "adds" has two practical meanings: (a) the irrevocable undertaking of the confirming bank is distinct and separate from that of the issuing bank - the term "adds" should be understood in conjunction with the phrase "in addition to that of the issuing bank," as defined in the term "Confirmation"; (b) an authorization or request to a bank to add confirmation to a credit does not obligate that bank to act - however, when the requested bank "adds" its confirmation to a credit and communicates it to the beneficiary, this bank becomes the "confirming bank" for the credit.

The issuing bank's authorization or request

The wording of "the issuing bank's authorization or request" has covered two practical scenarios:

(a) The issuing bank's authorization - When the issuing bank issues a credit by inserting "MAY ADD" in field 49 (mandatory field) of the MT 700, along with the requested confirmation party in field 58a, the phrase "MAY ADD" indicates that the bank mentioned in Field 58a is authorized to add its confirmation on the request of the beneficiary. In this situation, the confirming bank typically advises the credit without adding its confirmation and awaits the beneficiary's request to add confirmation to the credit. Under this arrangement, the beneficiary will pay the confirmation fee, usually in advance.

(b) The issuing bank's request - When the issuing bank issues a credit by inserting "CONFIRM" in field 49 (mandatory field) of the MT 700, along with the requested confirmation party in field 58a, the insertion of "CONFIRM" implies that the bank stated in Field 58a is requested to add its confirmation to the credit. The confirmation fee may be paid from either the applicant's or the beneficiary's account.`,
  },
  {
    title: 'Who can Negotiate',
    slug: 'who-can-negotiate',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-04-23T16:47:08.405Z',
    content: `The term "negotiation" was first formally defined in UCP 500, more than thirty years ago. Nevertheless, many practitioners continue to use the terms "negotiating bank" and "nominated bank" interchangeably when referring to the role of a nominated bank in a documentary credit transaction-whether in formal or informal discussions. Similarly, the term "negotiate" is frequently applied indiscriminately to any advance payment made to the beneficiary, irrespective of the credit's availability. Such usage is technically incorrect.

According to UCP 600, Article 12 (a), "Unless a nominated bank is the confirming bank, an authorization to honour or negotiate does not impose any obligation on that nominated bank to honour or negotiate, except when expressly agreed to by that nominated bank and so communicated to the beneficiary." Hence, the issuing bank may authorize the nominated bank to honour or negotiate.

How does this authorization reflect in the text of the credit? This authorization is expressly provided by stating the credit availability in the credit. A credit is available with the nominated bank by one of the following methods: payment, deferred payment, acceptance, or negotiation. When a credit is expressly available with the nominated bank by negotiation, the issuing bank authorizes that nominated bank to negotiate, as defined in UCP 600 Article 2.

Similarly, when a credit is available with the confirming bank by negotiation, the confirming bank is obligated to negotiate, without recourse, under a complying presentation according to UCP 600, Sub-Article 8 (a)(ii).

Furthermore, when a credit is available with a nominated bank by negotiation, and the beneficiary makes a complying presentation, the nominated bank is not obligated to negotiate. If the nominated bank decides not to negotiate and merely forwards the documents to the confirming bank, the confirming bank is obligated to honour (not negotiate) the presentation.`,
  },
  {
    title: 'Can a non-bank issue a credit under UCP?',
    slug: 'can-a-non-bank-issue-a-credit-under-ucp',
    category: 'UCP',
    readingTime: 1,
    publishedAt: '2026-03-14T04:29:41.018Z',
    content: `ICC Banking Commission addressed this question during the time of UCP 500 through its official opinion R 505/ TA537 (1995-2004) as follows:

Neither the ICC Banking Commission nor the UCP can determine the authority of the issuer of documentary credits subject to UCP 500 [currently UCP 600]. This is a regulatory matter under the local law of the issuing country.

In some countries, any entity can issue documentary credits subject to the fulfilment of certain conditions. In other countries, issuance is limited to financial institutions, which may include insurance companies, banks, and non-bank financial institutions.

The UCP is a set of voluntary rules of practice. The rules can be expressly modified or excluded by the text of the credit as articulated in Article 1. Issuance by a non-bank constitutes such a modification. Hence, a non-bank can issue documentary credits subject to UCP 600.`,
  },
  {
    title:
      "To what extent is the confirming bank's undertaking available under discrepant documents?",
    slug: 'to-what-extent-is-the-confirming-banks-undertaking-available-under-discrepant-documents',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-01-30T17:28:04.378Z',
    content: `Background [based on ICC Official Opinion, R520 / TA543 rev2, R737 / TA742rev]

Bank CB added its confirmation to the credit on the request of Bank IB (the issuing bank) under a credit available with the confirming bank by negotiation. The tenor was 180 days from the date of shipment. The beneficiary made a presentation to the CB. The CB examined the presentation and provided a notice of refusal. The beneficiary failed to correct the discrepancy within the last date of presentation and/or the expiry date of the credit. Following the beneficiary's instructions, Bank CB forwarded the documents to Bank IB, which accepted the presentation and communicated the maturity date.

The queries are: (a) What is the status of the CB after providing notice of refusal? (b) Does the confirming bank obligate to pay at maturity, as the IB waived the discrepancy? (c) Whether the CB needs further consent from the issuing bank to reinstate the confirmation to the credit?

(a) What is the status of the CB after providing notice of refusal? - If the beneficiary failed to correct the discrepancy within the last date of presentation and/or expiry date of the credit against an adequate, timely notice of refusal from the CB, the CB's undertaking to negotiate (without recourse) is not available for this presentation.

(b) Does the confirming bank obligate to pay at maturity, as the IB waived the discrepancy? - CB is not obligated to negotiate (without recourse), even though the IB waived the discrepancies and accepted the presentation.

(c) Whether the CB needs further consent from the issuing bank to reinstate the confirmation to the credit? - Any subsequent agreement by the confirming bank to reinstate its confirmation is at the sole discretion of the confirming bank. It may do so without further reference to, or authorization from, the issuing bank.`,
  },
  {
    title: 'When to Negotiate',
    slug: 'when-to-negotiate',
    category: 'UCP',
    readingTime: 1,
    publishedAt: '2026-05-02T04:14:19.059Z',
    content: `In a typical credit available by negotiation, the beneficiary may present documents, with a negotiation (advance fund) request, to the nominated bank. The nominated bank may then negotiate the documents and forward them to the issuing bank, which reimburses the nominated bank in accordance with the credit term as instructed in the covering schedule.

In certain cases-particularly in usance negotiation-the nominated bank may choose to forward the documents first. The issuing bank issues its acceptance upon presentation, after which the nominated bank may negotiate at the beneficiary's request.

Fundamentally, the latest time for a nominated bank to negotiate a complying presentation is on or before the banking day when reimbursement from the issuing bank becomes due. Hence, negotiation may occur either before or after the forwarding of documents, but it must always take place on or before the reimbursement due to the nominated bank.`,
  },
  {
    title: 'The Definition of "Presentation"',
    slug: 'the-definition-of-presentation',
    category: 'UCP',
    readingTime: 2,
    publishedAt: '2026-06-05T19:08:00.694Z',
    content: `Presentation means either the delivery of documents under a credit to the issuing bank or nominated bank, or the documents so delivered.

Before we elaborate further on this context, let us first look at where the presentation usually takes place in documentary credit operations. The beneficiary forwards the documents to the nominated bank, which in turn forwards them to the confirming bank, and the confirming bank then forwards them to the issuing bank. In other words, the presentation takes place in the nominated bank, the confirming bank, and the issuing bank.

The term "Presentation" encompasses two different uses: (a) the delivery of documents under a credit, or (b) the documents so delivered. Hence, it should be understood as two different phases of a process:

The delivery of documents - According to the commentary of UCP 600, the delivery of documents refers to the actual delivery of the documents (physical presentation) to the bank. In other words, the term "delivery" in UCP 600 signifies the actual receipt of the documents by the nominated bank or the issuing bank (in the case of direct presentation, bypassing the nominated bank). Hence, merely sending the documents to a nominated bank or the issuing bank that has yet to receive does not constitute a presentation [UCP 600: An Analytical Commentary, Page No. 192, Point 13].

The documents so delivered - According to the commentary on UCP 600, the term refers to documents that have already been delivered to the bank and are in its possession. Any presentation made at the mailroom or reception desk of the nominated bank, or the issuing bank, is to be considered a presentation, unless otherwise stipulated in the credit.

An Important Consideration - Although not addressed in UCP 600, a presentation need not contain all the documents required by the credit to constitute a presentation.`,
  },
];
