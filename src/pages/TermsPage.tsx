import type { ReactNode } from "react";
import { useLanguage } from "../context/LanguageContext";
import { studioContacts } from "../config/studioContacts";
import { InkText } from "../components/motion/InkText";
import { LegalNav } from "../components/legal/LegalNav";
import { Link } from "../lib/router";
import styles from "./LegalDocument.module.css";

/**
 * What a commission actually commits both sides to, written down.
 *
 * The site asks people to describe a wedding, a record, a company to a studio
 * they have not met, and then to pay half of a fee before anything is built.
 * Nothing on it said what that buys, what happens to the money if the project
 * stops, who owns the result, or how long the studio is on the hook after
 * launch. Those answers existed in the studio's head and in individual
 * quotations. They belong somewhere a prospective client can read them before
 * making contact rather than after.
 *
 * The wording here is the studio's own and is reproduced as written. This page
 * formats it; it does not paraphrase it. That distinction matters more here than
 * anywhere else on the site — house voice is an editorial instrument, and an
 * editorial instrument applied to a clause about refunds changes what the clause
 * means.
 *
 * Clause numbers are kept in the headings for the same reason: an agreement is
 * read by reference, and a client who needs to point at the revisions rule
 * should be able to say "clause 07" and be understood. The anchors are named
 * rather than numbered so that the addresses survive a renumbering.
 *
 * These are the general website Terms. They are explicitly outranked by whatever
 * a specific project agreement says, which is the honest ordering: this page
 * sets expectations, a quotation sets the deal.
 *
 * **What the clauses have to close.** An agreement written entirely in the
 * client's favour is not generous, it is unfinished — it leaves the studio
 * carrying risks it cannot price, and a studio that cannot price its risks
 * eventually stops being able to take the work. The gaps that were open, and are
 * now closed, were: a project could be abandoned indefinitely without ever
 * becoming a cancellation (05); final approval could be withheld forever, so
 * nothing was ever "delivered" and the final invoice never fell due (14);
 * cancelling at ninety per cent complete cost the client nothing beyond the
 * deposit (16); a breach by the client had no stated consequence for money
 * already paid (17); and liability was unbounded, with a cap nowhere on the page
 * (23). None of those changes take anything from a client acting in good faith,
 * which is the test each of them was written against.
 *
 * The one thing this page must never do is disagree with the Privacy Policy.
 * Clause 12 is the authority on publicity; the policy now points here rather
 * than promising something narrower, because two documents describing the same
 * permission in different words is the failure mode that makes both unusable.
 */

type Section = { id: string; title: string; body: ReactNode };

export function TermsPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const email = (
    <a href={studioContacts.email.href}>{studioContacts.email.value}</a>
  );

  const sections: Section[] = isEnglish
    ? [
        {
          id: "services",
          title: "01 — Services",
          body: (
            <>
              <p>
                House Adel provides creative and digital services that may include creative
                direction, web design, interface design, interactive web experiences, front-end
                development, digital invitations, wedding and private-event websites, portfolio
                websites, artist and musician websites, editorial websites, brand and campaign
                websites, selected e-commerce integrations, and other digital work agreed with a
                client.
              </p>
              <p>
                The exact scope, deliverables, price and estimated schedule of each commission will
                be defined in the relevant quotation, proposal or project agreement.
              </p>
              <p>
                Unless specifically agreed, House Adel does not provide custom backend
                infrastructure, photography, ongoing content management, indefinite maintenance, or
                custom 3D modelling.
              </p>
              <p>
                Additional services, including copywriting, 3D production, advanced integrations,
                hosting assistance, domain registration, search optimisation, e-commerce
                functionality or other specialist work may be provided or coordinated where agreed
                and may involve additional fees or third-party providers.
              </p>
              <p>
                House Adel may use third-party platforms and infrastructure such as hosting
                providers, commerce platforms, content-management systems, domain registrars, APIs
                and other technical services. House Adel does not own or control those third-party
                services and does not represent itself as their provider.
              </p>
            </>
          ),
        },
        {
          id: "inquiries",
          title: "02 — Inquiries and acceptance",
          body: (
            <>
              <p>
                Submitting an inquiry or consultation questionnaire does not create a client
                relationship, guarantee availability, or oblige House Adel to accept a project.
              </p>
              <p>House Adel may accept or decline an inquiry at its discretion.</p>
              <p>
                If House Adel wishes to proceed, the prospective client will receive confirmation
                together with the applicable quotation, proposal and/or project terms.
              </p>
              <p>
                Unless otherwise agreed in writing, a commission becomes confirmed and production
                begins only after the client has accepted the applicable project terms and House
                Adel has received the required initial payment.
              </p>
              <p>
                Quotations will ordinarily remain valid for 30 days unless another validity period
                is stated. If a client wishes to proceed after that period, House Adel may confirm
                or revise the quotation before accepting the commission.
              </p>
            </>
          ),
        },
        {
          id: "fees",
          title: "03 — Fees and payment",
          body: (
            <>
              <p>
                Unless otherwise stated in a project agreement, commissioned work is paid in two
                stages:
              </p>
              <ul>
                <li>50% initial payment before work begins;</li>
                <li>50% final payment before final launch, transfer or delivery.</li>
              </ul>
              <p>House Adel is not required to begin work before receiving the initial payment.</p>
              <p>
                Once the commissioned work is ready for final review, House Adel may provide a
                private preview or equivalent means for the client to review the completed work.
              </p>
              <p>
                Unless otherwise stated, the final balance is due within seven calendar days of the
                final invoice and must be received before the final website, files, ownership
                rights, credentials or other final deliverables are launched or transferred.
              </p>
              <p>
                Failure to pay the final balance does not entitle the client to receive or use
                unpaid final work.
              </p>
              <p>
                Fees are payable in the currency specified in the quotation or invoice. House Adel
                may quote Indonesian clients in IDR and may agree to another currency for
                international projects.
              </p>
              <p>
                Any bank, intermediary, currency-conversion, transfer or payment-processing fees
                necessary for House Adel to receive the invoiced amount are the client's
                responsibility unless otherwise agreed.
              </p>
              <p>
                Quoted fees are exclusive of any tax, duty or levy applicable to the work. Where
                applicable law requires the client to withhold or deduct an amount from a payment,
                the client remains responsible for accounting for it correctly and for providing
                House Adel with the relevant evidence of withholding.
              </p>
              <p>
                If the final balance is not received within thirty calendar days of its due date,
                House Adel may suspend further work, continue to withhold delivery, and treat the
                non-payment as a material breach for the purposes of clause 17.
              </p>
              <p>
                House Adel currently accepts the payment methods communicated directly to the client
                at the time of commissioning. Availability of particular payment methods may change.
              </p>
            </>
          ),
        },
        {
          id: "third-party-costs",
          title: "04 — Third-party costs",
          body: (
            <>
              <p>
                Domains, hosting, commerce platforms, content-management services, premium assets,
                APIs and other external products or subscriptions are not included in House Adel's
                creative fee unless expressly stated.
              </p>
              <p>
                Where House Adel purchases or arranges an approved third-party product on a client's
                behalf, that cost may appear separately on the client's quotation or invoice.
              </p>
              <p>
                House Adel will not knowingly incur a material additional third-party cost on behalf
                of a client without approval.
              </p>
              <p>
                Clients are responsible for recurring renewal and subscription charges associated
                with their website unless otherwise agreed.
              </p>
              <p>
                Where practical, domains, hosting accounts and other essential client infrastructure
                should ultimately be registered to or controlled by the client. House Adel may
                receive collaborator or administrative access necessary to perform its work.
              </p>
              <p>
                If House Adel temporarily registers or purchases an asset or service on a client's
                behalf, control may be transferred to the client where the relevant provider permits
                it.
              </p>
              <p>
                Changes to third-party pricing, policies, availability or renewal costs are outside
                House Adel's control.
              </p>
            </>
          ),
        },
        {
          id: "schedules",
          title: "05 — Project schedules",
          body: (
            <>
              <p>
                Any completion date or project duration provided by House Adel is an estimate unless
                expressly identified as a guaranteed contractual deadline.
              </p>
              <p>House Adel will make reasonable efforts to meet agreed schedules.</p>
              <p>A schedule may reasonably change because of circumstances including:</p>
              <ul>
                <li>client response delays;</li>
                <li>missing content, information or assets;</li>
                <li>approved changes to the project scope;</li>
                <li>additional requested work;</li>
                <li>technical dependencies;</li>
                <li>third-party outages or changes;</li>
                <li>illness or emergency;</li>
                <li>events outside House Adel's reasonable control.</li>
              </ul>
              <p>
                If a client becomes unresponsive, House Adel may pause the project. When the client
                returns, work may be rescheduled according to House Adel's then-current
                availability.
              </p>
              <p>
                A pause of up to thirty calendar days does not itself attract a fee. Where a pause
                caused by the client runs longer than that, House Adel may quote a rescheduling fee
                reflecting production time that was reserved for the commission and released too
                late to be given to another project. Any such fee will be communicated and agreed
                before chargeable work resumes.
              </p>
              <p>
                Where a client remains unresponsive for sixty consecutive days despite at least two
                written attempts to reach them at the contact details they provided, House Adel may
                treat the commission as cancelled by the client under clause 16.
              </p>
            </>
          ),
        },
        {
          id: "responsibilities",
          title: "06 — Client responsibilities",
          body: (
            <>
              <p>
                The client is responsible for providing information, materials, approvals and
                feedback reasonably required to complete the project.
              </p>
              <p>
                The client is responsible for checking names, dates, addresses, contact information,
                prices, event information, RSVP information, spelling, factual claims and other
                client-supplied information before final launch.
              </p>
              <p>
                House Adel may assist with corrections but assistance does not transfer
                responsibility for the accuracy of information supplied or approved by the client.
              </p>
              <p>
                For event and RSVP systems, the client remains responsible for the accuracy and
                management of guest information. House Adel is not responsible for incorrect
                information submitted by guests or other users.
              </p>
            </>
          ),
        },
        {
          id: "revisions",
          title: "07 — Revisions",
          body: (
            <>
              <p>
                Unless another arrangement is stated in the project agreement, a commission includes
                up to three revision rounds.
              </p>
              <p>
                A revision round means one reasonably consolidated set of feedback submitted by the
                client for the relevant stage of work.
              </p>
              <p>
                Minor adjustments and modifications within the agreed project direction may
                constitute revisions.
              </p>
              <p>
                Corrections required because House Adel's work does not conform to the agreed scope,
                or because of a technical defect caused by House Adel, do not consume a revision
                round.
              </p>
              <p>
                A substantial change to an approved direction, new page, new feature, new
                integration, major redesign, or other work materially outside the agreed scope may
                be treated as additional work rather than a revision.
              </p>
              <p>
                House Adel will not impose an additional charge for new scope without communicating
                the change and obtaining the client's approval before carrying out the chargeable
                additional work.
              </p>
              <p>
                Once the included revision rounds have been used, further revisions may be
                separately quoted before additional work continues.
              </p>
              <p>
                Changing previously approved work may count as an additional revision or additional
                scope depending on the extent of the change.
              </p>
            </>
          ),
        },
        {
          id: "direction",
          title: "08 — Creative direction",
          body: (
            <>
              <p>
                House Adel works collaboratively and will follow the client's stated requirements,
                objectives, preferences and feedback within the agreed scope.
              </p>
              <p>
                Where a client grants House Adel broader creative direction, House Adel may exercise
                greater creative discretion.
              </p>
              <p>
                House Adel may advise against a requested decision but will not treat personal
                aesthetic preference alone as grounds to override the client's final direction for
                their own commissioned website.
              </p>
              <p>
                House Adel may, however, decline to implement a request that is unlawful, infringes
                third-party rights, creates a material security risk, substantially compromises
                accessibility or technical stability, or falls outside the agreed project scope.
              </p>
              <p>
                Technical implementation methods may be determined according to the requirements of
                each project and may change during development where reasonably necessary.
              </p>
            </>
          ),
        },
        {
          id: "production",
          title: "09 — Production methods and third-party material",
          body: (
            <>
              <p>
                House Adel may use appropriate development software, frameworks, libraries,
                automation, development tools, licensed resources, open-source software and
                third-party services in producing commissioned work.
              </p>
              <p>
                House Adel does not represent that every element of a commissioned website is
                created entirely from first principles.
              </p>
              <p>
                Third-party materials may be used only where House Adel reasonably understands their
                applicable licence or permission to allow the intended use.
              </p>
              <p>
                Where an asset, font, service, model, photograph, audio work or other resource
                requires a separate commercial or client licence, the associated cost and
                requirements may be communicated to the client.
              </p>
              <p>Required attribution associated with third-party material may be included where necessary.</p>
              <p>
                House Adel retains discretion over its internal production workflow provided that
                the final work complies with the agreed project requirements.
              </p>
            </>
          ),
        },
        {
          id: "client-material",
          title: "10 — Client-supplied material",
          body: (
            <>
              <p>
                By supplying House Adel with photographs, videos, music, fonts, logos, artwork,
                text, trademarks or other material, the client represents that they own the material
                or have sufficient permission to use it for the project.
              </p>
              <p>
                The client remains responsible for obtaining appropriate rights and permissions for
                client-supplied materials.
              </p>
              <p>
                House Adel may refuse to publish or use material that it reasonably believes is
                unlawful, infringing, harmful, or otherwise inappropriate for the agreed project.
              </p>
              <p>
                House Adel is not responsible for a third-party copyright or intellectual-property
                claim resulting from material supplied or specifically requested by the client where
                the client did not possess the necessary rights.
              </p>
              <p>
                Where such a claim is brought against House Adel, the client will reimburse House
                Adel for the reasonable costs and losses it incurs in dealing with it, to the extent
                the claim arises from material the client supplied or specifically requested without
                holding the necessary rights.
              </p>
            </>
          ),
        },
        {
          id: "ownership",
          title: "11 — Intellectual property and ownership",
          body: (
            <>
              <p>
                Until full payment has been received, House Adel retains rights in unpaid
                commissioned work to the extent permitted by applicable law and the relevant project
                agreement.
              </p>
              <p>
                Following full payment, the client receives the rights to the final commissioned
                website and final bespoke design as specified in the applicable project agreement.
              </p>
              <p>
                The client retains ownership of their own pre-existing names, trademarks,
                photographs, copy, artwork and other client materials.
              </p>
              <p>
                Unless specifically transferred in writing, House Adel retains ownership of its
                pre-existing intellectual property and reusable development methods, systems,
                components, tools, techniques, workflows, know-how, code utilities, animation
                techniques and other materials capable of use independently of the client's final
                bespoke composition.
              </p>
              <p>
                The transfer of a commissioned design does not give a client exclusive ownership
                over a general design technique, programming method, animation principle or
                development process.
              </p>
              <p>
                House Adel will not intentionally resell another client's exact bespoke final
                composition as a new bespoke commission.
              </p>
              <p>
                Source code may be provided to the client upon request following full payment,
                subject to third-party licences and any project-specific agreement.
              </p>
              <p>
                Following handover, the client may modify or arrange modification of their website.
                House Adel is not responsible for defects, damage or incompatibility introduced
                through changes made by the client or another party after handover.
              </p>
            </>
          ),
        },
        {
          id: "portfolio",
          title: "12 — Portfolio and publicity",
          body: (
            <>
              <p>
                Unless confidentiality has been agreed, House Adel may document completed work for
                its portfolio, studies, case studies, social media, presentations and promotional
                materials.
              </p>
              <p>
                This may include non-sensitive screenshots, screen recordings, descriptions of the
                project, and, where appropriate, the public identity of the client, brand or event.
              </p>
              <p>
                For websites that are intended to be public, House Adel may occasionally link to the
                live website where appropriate.
              </p>
              <p>
                House Adel will not intentionally publish private guest information, private contact
                details, confidential questionnaire responses, private addresses or other sensitive
                personal information merely for portfolio purposes.
              </p>
              <p>
                Private-event websites will not ordinarily be publicly linked from House Adel's
                portfolio.
              </p>
              <p>A client may request removal of a public live link or sensitive/personal material.</p>
              <p>
                Unless complete confidentiality has separately been agreed, House Adel may retain
                non-sensitive screenshots, recordings and documentation of its design work for
                archival, study and portfolio purposes.
              </p>
              <p>
                This clause continues to apply after a project has been completed or otherwise
                ended, subject to the client's right under it to ask for a public live link, or
                sensitive or personal material, to be removed.
              </p>
              <p>
                Clients who require complete confidentiality should communicate this requirement so
                that it can be expressly agreed.
              </p>
            </>
          ),
        },
        {
          id: "credit",
          title: "13 — Website credit",
          body: (
            <>
              <p>
                House Adel does not require a visible watermark or public design credit on a
                client's finished website unless separately agreed.
              </p>
              <p>A client may voluntarily credit House Adel.</p>
              <p>
                House Adel may include reasonable non-visible development attribution where
                appropriate, provided it does not interfere with the website, expose confidential
                information, or misrepresent ownership.
              </p>
            </>
          ),
        },
        {
          id: "handover",
          title: "14 — Launch, handover and bug corrections",
          body: (
            <>
              <p>
                Where House Adel invites the client in writing to review a stage of the work or the
                completed work, and no written feedback is received within ten business days, that
                stage may be treated as approved so that the project can proceed. The invitation
                will say so at the time it is sent.
              </p>
              <p>
                Unless otherwise agreed, a commission is considered delivered when the final
                approved work has been launched, transferred or otherwise made available to the
                client following full payment.
              </p>
              <p>
                House Adel will provide a 14-calendar-day post-delivery period for correction of
                reproducible technical defects caused by House Adel and relating to the agreed
                delivered scope.
              </p>
              <p>
                A technical defect means delivered functionality materially failing to behave as
                agreed.
              </p>
              <p>The correction period does not include:</p>
              <ul>
                <li>new features;</li>
                <li>new design requests;</li>
                <li>new content;</li>
                <li>additional revisions;</li>
                <li>changes to previously approved work;</li>
                <li>problems caused by client modifications;</li>
                <li>problems caused by third-party modifications;</li>
                <li>future browser or operating-system changes;</li>
                <li>third-party service changes or discontinuation;</li>
                <li>new integrations;</li>
                <li>ongoing content updates.</li>
              </ul>
              <p>
                House Adel may voluntarily assist with small matters outside this definition, but
                such assistance does not create an ongoing maintenance obligation.
              </p>
              <p>
                After the correction period, future work may be separately quoted if House Adel
                agrees to undertake it.
              </p>
            </>
          ),
        },
        {
          id: "maintenance",
          title: "15 — Maintenance",
          body: (
            <>
              <p>
                Ongoing maintenance is not included in a standard House Adel commission unless
                expressly agreed.
              </p>
              <p>
                House Adel does not guarantee indefinite maintenance, updates or technical support
                for completed websites.
              </p>
              <p>
                A former client may contact House Adel for future work. House Adel may accept or
                decline that work and provide a new quotation based on the requirements and
                availability at that time.
              </p>
            </>
          ),
        },
        {
          id: "cancellation",
          title: "16 — Cancellation by the client",
          body: (
            <>
              <p>A client may request cancellation of a commission in writing.</p>
              <p>
                Where cancellation occurs during the first seven calendar days following the initial
                payment and before substantial work has begun, any refund will take into account
                work already performed and any non-refundable third-party costs already incurred
                specifically for the project.
              </p>
              <p>
                After that period, or once substantial work has begun, the initial payment is
                non-refundable to the extent permitted by applicable law, because it compensates
                House Adel for work performed and for production time reserved for the commission
                and released too late to be given to another project.
              </p>
              <p>
                Cancelling does not by itself make the unpaid final 50% due. The client does remain
                responsible for work properly performed up to the date of cancellation, and for any
                separately approved additional work or third-party costs already incurred. Where the
                value of that work exceeds the initial payment, House Adel may invoice the
                difference, up to but never beyond the total agreed fee.
              </p>
              <p>
                Unfinished concepts and work that have not been transferred to the client remain
                with House Adel unless otherwise agreed.
              </p>
              <p>Any statutory rights that cannot lawfully be excluded remain unaffected.</p>
            </>
          ),
        },
        {
          id: "termination",
          title: "17 — Termination by House Adel",
          body: (
            <>
              <p>
                House Adel may terminate or suspend a commission where reasonably necessary because
                of serious circumstances including material non-payment, unlawful requests, abusive
                or threatening conduct, or a material breach of the agreed project terms.
              </p>
              <p>
                Where termination follows the client's material breach, fees already received are
                not refundable to the extent permitted by applicable law, and work properly
                performed but not yet invoiced remains chargeable.
              </p>
              <p>
                Where House Adel chooses to terminate a project for its own reasons and the client
                has not materially breached the agreement, House Adel will refund fees received for
                work that will not be delivered, with the specific treatment of completed work and
                approved third-party expenses determined fairly according to the circumstances and
                applicable agreement.
              </p>
              <p>
                Termination does not affect rights or obligations that arose before termination.
              </p>
            </>
          ),
        },
        {
          id: "third-party-services",
          title: "18 — Third-party services",
          body: (
            <>
              <p>Websites may depend on third-party infrastructure and services.</p>
              <p>
                House Adel is not responsible for outages, security incidents, policy changes,
                discontinuation, account restrictions, price changes or other failures caused by
                third-party providers outside House Adel's reasonable control.
              </p>
              <p>
                If a third-party integration changes or ceases functioning after delivery, adapting
                the website may require separately commissioned work unless otherwise covered by an
                agreement.
              </p>
              <p>
                Where technically necessary, House Adel may recommend or propose an alternative
                provider. Any change materially affecting the client's costs, ownership or data
                processing will be communicated before implementation where reasonably possible.
              </p>
            </>
          ),
        },
        {
          id: "hosting",
          title: "19 — Hosting, domains and website availability",
          body: (
            <>
              <p>
                Unless otherwise agreed, the client is responsible for maintaining and paying for
                the services necessary to keep their website online, including applicable domain and
                hosting renewals.
              </p>
              <p>
                House Adel does not guarantee that a website will remain online indefinitely where
                required third-party services are no longer maintained or paid for.
              </p>
              <p>
                For wedding and private-event websites, the default may be for the website to remain
                available for as long as its required services remain active, unless the client asks
                for it to be archived or removed.
              </p>
              <p>
                A client may request that House Adel assist in taking a website offline where House
                Adel still has the necessary access, but House Adel does not guarantee permanent
                administrative access after handover.
              </p>
              <p>
                House Adel may retain non-personal design records for legitimate archival, portfolio
                and study purposes. Handling of personal information is governed separately by the{" "}
                <Link to="/privacy" data-sonic>House Adel Privacy Policy</Link>.
              </p>
            </>
          ),
        },
        {
          id: "cms",
          title: "20 — CMS, publication and client-managed content",
          body: (
            <>
              <p>
                Where House Adel provides a content-management interface or integrates a third-party
                publishing system, content published by the client after handover remains the
                client's responsibility.
              </p>
              <p>
                House Adel does not become the publisher, editor or owner of client-created content
                merely because House Adel designed or developed the website.
              </p>
              <p>
                Problems introduced by client-created content, incompatible uploads, client
                modifications or misuse of the content-management system may require separately
                commissioned work to correct.
              </p>
            </>
          ),
        },
        {
          id: "results",
          title: "21 — No guarantee of commercial results",
          body: (
            <>
              <p>
                House Adel does not guarantee a particular commercial, promotional or audience
                result from a commissioned website.
              </p>
              <p>This includes, without limitation, guarantees concerning:</p>
              <ul>
                <li>sales;</li>
                <li>traffic;</li>
                <li>search ranking;</li>
                <li>RSVP numbers;</li>
                <li>conversion rates;</li>
                <li>followers;</li>
                <li>media coverage;</li>
                <li>engagement;</li>
                <li>business revenue.</li>
              </ul>
              <p>
                House Adel's obligation is to provide the agreed creative and technical
                deliverables, not to guarantee how audiences or markets respond to them.
              </p>
            </>
          ),
        },
        {
          id: "compatibility",
          title: "22 — Technical compatibility",
          body: (
            <>
              <p>
                House Adel aims to provide a functional experience across reasonable contemporary
                browsers and devices appropriate to the project.
              </p>
              <p>
                House Adel does not guarantee compatibility with every historical, modified,
                unsupported or future browser, device, operating system or third-party environment.
              </p>
              <p>
                Interactive and technically advanced experiences may differ appropriately between
                desktop and mobile devices for reasons including performance, accessibility, input
                method and hardware capability.
              </p>
            </>
          ),
        },
        {
          id: "liability",
          title: "23 — Liability and fair use of these Terms",
          body: (
            <>
              <p>
                Nothing in these Terms excludes or restricts rights or liabilities that cannot
                lawfully be excluded under applicable law.
              </p>
              <p>
                House Adel is not responsible for indirect losses or failures arising solely from
                circumstances outside its reasonable control, third-party services, client-supplied
                information or materials, or modifications made after handover by persons other than
                House Adel.
              </p>
              <p>
                Subject to the paragraph above about rights that cannot lawfully be excluded, House
                Adel's total liability arising out of or in connection with a commission is limited
                to the fees actually paid by the client for that commission. That limit does not
                apply to the client's own obligation to pay fees properly due.
              </p>
              <p>
                Any limitation of responsibility in these Terms should be interpreted only to the
                extent permitted by applicable law.
              </p>
            </>
          ),
        },
        {
          id: "eligibility",
          title: "24 — Eligibility and capacity",
          body: (
            <>
              <p>
                A person entering into a paid commission must have the legal capacity to enter into
                the relevant agreement.
              </p>
              <p>
                Where a prospective client does not have the necessary legal capacity, a parent,
                legal guardian or other legally authorised person must enter into the agreement
                where required.
              </p>
              <p>
                House Adel may request that the appropriate adult or authorised representative
                approve the commission and make payment where necessary.
              </p>
            </>
          ),
        },
        {
          id: "law",
          title: "25 — Governing law and disputes",
          body: (
            <>
              <p>
                These Terms and House Adel commissions are governed by the laws of the Republic of
                Indonesia, except where mandatory applicable law requires otherwise.
              </p>
              <p>
                If a disagreement arises, House Adel and the client should first make reasonable
                efforts to resolve the matter directly and in good faith.
              </p>
              <p>
                If the matter cannot be resolved informally, the parties may pursue the remedies
                available to them under applicable Indonesian law or any dispute-resolution
                procedure specifically agreed in the applicable project agreement.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "26 — Changes to these Terms",
          body: (
            <>
              <p>House Adel may update these website Terms from time to time.</p>
              <p>The date of the current version will be displayed at the beginning of this page.</p>
              <p>
                Updating the public Terms does not silently rewrite an existing commissioned
                project's agreement.
              </p>
              <p>
                Unless the parties expressly agree otherwise, the version of these Terms
                incorporated into or referenced by a client's accepted project agreement will
                continue to apply to that project.
              </p>
            </>
          ),
        },
        {
          id: "severability",
          title: "27 — Severability",
          body: (
            <p>
              If a provision of these Terms is determined to be invalid, unlawful or unenforceable,
              that provision will be interpreted or limited to the extent necessary under applicable
              law without automatically invalidating the remaining provisions.
            </p>
          ),
        },
        {
          id: "privacy",
          title: "28 — Privacy",
          body: (
            <>
              <p>
                The collection and processing of personal information through House Adel is governed
                by the separate{" "}
                <Link to="/privacy" data-sonic>House Adel Privacy Policy</Link>.
              </p>
              <p>The Privacy Policy should be read together with these Terms where applicable.</p>
            </>
          ),
        },
        {
          id: "contact",
          title: "29 — Contact",
          body: (
            <>
              <p>
                Questions concerning these Terms or a House Adel commission may be directed to:
              </p>
              <address className={styles.address}>
                <span>House Adel</span>
                <span>{email}</span>
                <span>Indonesia</span>
              </address>
            </>
          ),
        },
      ]
    : [
        {
          id: "services",
          title: "01 — Layanan",
          body: (
            <>
              <p>
                House Adel menyediakan layanan kreatif dan digital yang dapat mencakup arahan
                kreatif, desain web, desain antarmuka, pengalaman web interaktif, pengembangan
                front-end, undangan digital, situs pernikahan dan acara privat, situs portofolio,
                situs seniman dan musisi, situs editorial, situs merek dan kampanye, integrasi
                e-commerce tertentu, serta pekerjaan digital lain yang disepakati dengan klien.
              </p>
              <p>
                Lingkup, hasil kerja, harga dan perkiraan jadwal yang tepat untuk setiap komisi akan
                ditetapkan dalam penawaran, proposal atau perjanjian proyek yang berlaku.
              </p>
              <p>
                Kecuali disepakati secara khusus, House Adel tidak menyediakan infrastruktur backend
                khusus, fotografi, pengelolaan konten berkelanjutan, pemeliharaan tanpa batas waktu,
                atau pemodelan 3D khusus.
              </p>
              <p>
                Layanan tambahan, termasuk penulisan naskah, produksi 3D, integrasi lanjutan,
                bantuan hosting, pendaftaran domain, optimisasi pencarian, fungsi e-commerce atau
                pekerjaan spesialis lain dapat disediakan atau dikoordinasikan apabila disepakati,
                dan dapat melibatkan biaya tambahan atau penyedia pihak ketiga.
              </p>
              <p>
                House Adel dapat menggunakan platform dan infrastruktur pihak ketiga seperti penyedia
                hosting, platform commerce, sistem manajemen konten, pendaftar domain, API dan
                layanan teknis lainnya. House Adel tidak memiliki atau mengendalikan layanan pihak
                ketiga tersebut dan tidak menyatakan dirinya sebagai penyedianya.
              </p>
            </>
          ),
        },
        {
          id: "inquiries",
          title: "02 — Pertanyaan dan penerimaan",
          body: (
            <>
              <p>
                Mengirimkan pertanyaan atau kuesioner konsultasi tidak menciptakan hubungan klien,
                tidak menjamin ketersediaan, dan tidak mewajibkan House Adel menerima sebuah proyek.
              </p>
              <p>
                House Adel dapat menerima atau menolak sebuah pertanyaan menurut pertimbangannya.
              </p>
              <p>
                Jika House Adel ingin melanjutkan, calon klien akan menerima konfirmasi beserta
                penawaran, proposal dan/atau ketentuan proyek yang berlaku.
              </p>
              <p>
                Kecuali disepakati lain secara tertulis, sebuah komisi baru terkonfirmasi dan
                produksi baru dimulai setelah klien menerima ketentuan proyek yang berlaku dan House
                Adel menerima pembayaran awal yang disyaratkan.
              </p>
              <p>
                Penawaran umumnya berlaku selama 30 hari kecuali dinyatakan masa berlaku lain. Jika
                klien ingin melanjutkan setelah masa itu, House Adel dapat menegaskan kembali atau
                merevisi penawaran sebelum menerima komisi tersebut.
              </p>
            </>
          ),
        },
        {
          id: "fees",
          title: "03 — Biaya dan pembayaran",
          body: (
            <>
              <p>
                Kecuali dinyatakan lain dalam perjanjian proyek, pekerjaan yang dikomisikan dibayar
                dalam dua tahap:
              </p>
              <ul>
                <li>50% pembayaran awal sebelum pekerjaan dimulai;</li>
                <li>50% pembayaran akhir sebelum peluncuran, pengalihan atau penyerahan akhir.</li>
              </ul>
              <p>
                House Adel tidak diwajibkan memulai pekerjaan sebelum menerima pembayaran awal.
              </p>
              <p>
                Setelah pekerjaan yang dikomisikan siap untuk peninjauan akhir, House Adel dapat
                menyediakan pratinjau privat atau sarana setara agar klien dapat meninjau pekerjaan
                yang telah selesai.
              </p>
              <p>
                Kecuali dinyatakan lain, sisa pembayaran akhir jatuh tempo dalam tujuh hari kalender
                sejak faktur akhir dan harus diterima sebelum situs, berkas, hak kepemilikan,
                kredensial atau hasil kerja akhir lainnya diluncurkan atau dialihkan.
              </p>
              <p>
                Kelalaian membayar sisa pembayaran akhir tidak memberi klien hak untuk menerima atau
                menggunakan pekerjaan akhir yang belum dibayar.
              </p>
              <p>
                Biaya dibayarkan dalam mata uang yang ditentukan pada penawaran atau faktur. House
                Adel dapat memberikan penawaran kepada klien Indonesia dalam IDR dan dapat
                menyepakati mata uang lain untuk proyek internasional.
              </p>
              <p>
                Setiap biaya bank, perantara, konversi mata uang, transfer atau pemrosesan
                pembayaran yang diperlukan agar House Adel menerima jumlah yang difakturkan menjadi
                tanggung jawab klien kecuali disepakati lain.
              </p>
              <p>
                Biaya yang ditawarkan belum termasuk pajak, bea atau pungutan apa pun yang berlaku
                atas pekerjaan tersebut. Apabila hukum yang berlaku mewajibkan klien memotong atau
                mengurangi suatu jumlah dari pembayaran, klien tetap bertanggung jawab untuk
                melaporkannya secara benar dan menyerahkan bukti pemotongan kepada House Adel.
              </p>
              <p>
                Jika sisa pembayaran akhir tidak diterima dalam tiga puluh hari kalender sejak
                tanggal jatuh temponya, House Adel dapat menghentikan sementara pekerjaan lanjutan,
                tetap menahan penyerahan, dan memperlakukan kelalaian pembayaran itu sebagai
                pelanggaran material untuk keperluan klausul 17.
              </p>
              <p>
                House Adel saat ini menerima metode pembayaran yang dikomunikasikan langsung kepada
                klien pada saat komisi dibuat. Ketersediaan metode pembayaran tertentu dapat berubah.
              </p>
            </>
          ),
        },
        {
          id: "third-party-costs",
          title: "04 — Biaya pihak ketiga",
          body: (
            <>
              <p>
                Domain, hosting, platform commerce, layanan manajemen konten, aset premium, API dan
                produk atau langganan eksternal lainnya tidak termasuk dalam biaya kreatif House
                Adel kecuali dinyatakan secara tegas.
              </p>
              <p>
                Apabila House Adel membeli atau mengatur produk pihak ketiga yang telah disetujui
                atas nama klien, biaya tersebut dapat dicantumkan terpisah pada penawaran atau
                faktur klien.
              </p>
              <p>
                House Adel tidak akan dengan sengaja menimbulkan biaya pihak ketiga tambahan yang
                material atas nama klien tanpa persetujuan.
              </p>
              <p>
                Klien bertanggung jawab atas biaya perpanjangan dan langganan berulang yang terkait
                dengan situs mereka kecuali disepakati lain.
              </p>
              <p>
                Apabila memungkinkan, domain, akun hosting dan infrastruktur penting klien lainnya
                pada akhirnya sebaiknya terdaftar atas nama atau dikendalikan oleh klien. House Adel
                dapat menerima akses kolaborator atau administratif yang diperlukan untuk
                menjalankan pekerjaannya.
              </p>
              <p>
                Jika House Adel untuk sementara mendaftarkan atau membeli aset atau layanan atas nama
                klien, kendalinya dapat dialihkan kepada klien apabila penyedia terkait
                mengizinkannya.
              </p>
              <p>
                Perubahan harga, kebijakan, ketersediaan atau biaya perpanjangan pihak ketiga berada
                di luar kendali House Adel.
              </p>
            </>
          ),
        },
        {
          id: "schedules",
          title: "05 — Jadwal proyek",
          body: (
            <>
              <p>
                Setiap tanggal penyelesaian atau durasi proyek yang diberikan House Adel merupakan
                perkiraan, kecuali secara tegas dinyatakan sebagai tenggat kontraktual yang dijamin.
              </p>
              <p>
                House Adel akan berupaya sewajarnya untuk memenuhi jadwal yang telah disepakati.
              </p>
              <p>Sebuah jadwal dapat berubah secara wajar karena keadaan yang mencakup:</p>
              <ul>
                <li>keterlambatan tanggapan klien;</li>
                <li>konten, informasi atau aset yang belum tersedia;</li>
                <li>perubahan lingkup proyek yang disetujui;</li>
                <li>pekerjaan tambahan yang diminta;</li>
                <li>ketergantungan teknis;</li>
                <li>gangguan atau perubahan pihak ketiga;</li>
                <li>sakit atau keadaan darurat;</li>
                <li>peristiwa di luar kendali wajar House Adel.</li>
              </ul>
              <p>
                Jika klien tidak lagi memberi tanggapan, House Adel dapat menjeda proyek. Ketika
                klien kembali, pekerjaan dapat dijadwalkan ulang sesuai ketersediaan House Adel pada
                saat itu.
              </p>
              <p>
                Jeda hingga tiga puluh hari kalender dengan sendirinya tidak dikenai biaya. Apabila
                jeda yang disebabkan klien berlangsung lebih lama dari itu, House Adel dapat
                menawarkan biaya penjadwalan ulang yang mencerminkan waktu produksi yang telah
                dicadangkan untuk komisi tersebut dan dilepaskan terlambat sehingga tidak dapat
                diberikan kepada proyek lain. Biaya semacam itu akan dikomunikasikan dan disepakati
                sebelum pekerjaan berbayar dilanjutkan.
              </p>
              <p>
                Apabila klien tidak memberi tanggapan selama enam puluh hari berturut-turut meskipun
                telah dihubungi secara tertulis sekurang-kurangnya dua kali melalui kontak yang
                mereka berikan, House Adel dapat memperlakukan komisi tersebut sebagai dibatalkan
                oleh klien berdasarkan klausul 16.
              </p>
            </>
          ),
        },
        {
          id: "responsibilities",
          title: "06 — Tanggung jawab klien",
          body: (
            <>
              <p>
                Klien bertanggung jawab menyediakan informasi, materi, persetujuan dan masukan yang
                secara wajar diperlukan untuk menyelesaikan proyek.
              </p>
              <p>
                Klien bertanggung jawab memeriksa nama, tanggal, alamat, informasi kontak, harga,
                informasi acara, informasi RSVP, ejaan, klaim faktual dan informasi lain yang
                disediakan klien sebelum peluncuran akhir.
              </p>
              <p>
                House Adel dapat membantu melakukan koreksi, tetapi bantuan tersebut tidak
                mengalihkan tanggung jawab atas keakuratan informasi yang disediakan atau disetujui
                oleh klien.
              </p>
              <p>
                Untuk sistem acara dan RSVP, klien tetap bertanggung jawab atas keakuratan dan
                pengelolaan informasi tamu. House Adel tidak bertanggung jawab atas informasi keliru
                yang dikirimkan oleh tamu atau pengguna lain.
              </p>
            </>
          ),
        },
        {
          id: "revisions",
          title: "07 — Revisi",
          body: (
            <>
              <p>
                Kecuali pengaturan lain dinyatakan dalam perjanjian proyek, sebuah komisi mencakup
                hingga tiga putaran revisi.
              </p>
              <p>
                Satu putaran revisi berarti satu rangkaian masukan yang telah dirangkum secara wajar
                dan dikirimkan klien untuk tahap pekerjaan yang bersangkutan.
              </p>
              <p>
                Penyesuaian dan perubahan kecil dalam arahan proyek yang telah disepakati dapat
                dihitung sebagai revisi.
              </p>
              <p>
                Koreksi yang diperlukan karena pekerjaan House Adel tidak sesuai dengan lingkup yang
                disepakati, atau karena cacat teknis yang disebabkan House Adel, tidak memakai satu
                putaran revisi.
              </p>
              <p>
                Perubahan substansial atas arahan yang telah disetujui, halaman baru, fitur baru,
                integrasi baru, perancangan ulang besar, atau pekerjaan lain yang secara material di
                luar lingkup yang disepakati dapat diperlakukan sebagai pekerjaan tambahan, bukan
                revisi.
              </p>
              <p>
                House Adel tidak akan mengenakan biaya tambahan untuk lingkup baru tanpa
                mengomunikasikan perubahan tersebut dan memperoleh persetujuan klien sebelum
                melaksanakan pekerjaan tambahan yang berbayar itu.
              </p>
              <p>
                Setelah putaran revisi yang termasuk dalam komisi habis terpakai, revisi selanjutnya
                dapat ditawarkan secara terpisah sebelum pekerjaan tambahan dilanjutkan.
              </p>
              <p>
                Mengubah pekerjaan yang sebelumnya telah disetujui dapat dihitung sebagai revisi
                tambahan atau lingkup tambahan, bergantung pada besarnya perubahan.
              </p>
            </>
          ),
        },
        {
          id: "direction",
          title: "08 — Arahan kreatif",
          body: (
            <>
              <p>
                House Adel bekerja secara kolaboratif dan akan mengikuti persyaratan, tujuan,
                preferensi dan masukan yang dinyatakan klien dalam lingkup yang disepakati.
              </p>
              <p>
                Apabila klien memberikan House Adel arahan kreatif yang lebih luas, House Adel dapat
                menggunakan kebebasan kreatif yang lebih besar.
              </p>
              <p>
                House Adel dapat menyarankan agar sebuah keputusan tidak diambil, tetapi tidak akan
                menjadikan preferensi estetika pribadi semata sebagai alasan untuk mengesampingkan
                arahan akhir klien atas situs yang mereka komisikan sendiri.
              </p>
              <p>
                Namun demikian, House Adel dapat menolak melaksanakan permintaan yang melanggar
                hukum, melanggar hak pihak ketiga, menimbulkan risiko keamanan yang material, secara
                substansial merusak aksesibilitas atau kestabilan teknis, atau berada di luar lingkup
                proyek yang disepakati.
              </p>
              <p>
                Metode implementasi teknis dapat ditentukan sesuai kebutuhan setiap proyek dan dapat
                berubah selama pengembangan apabila secara wajar diperlukan.
              </p>
            </>
          ),
        },
        {
          id: "production",
          title: "09 — Metode produksi dan materi pihak ketiga",
          body: (
            <>
              <p>
                House Adel dapat menggunakan perangkat lunak pengembangan, kerangka kerja, pustaka,
                otomatisasi, alat pengembangan, sumber daya berlisensi, perangkat lunak sumber
                terbuka dan layanan pihak ketiga yang sesuai dalam memproduksi pekerjaan yang
                dikomisikan.
              </p>
              <p>
                House Adel tidak menyatakan bahwa setiap elemen situs yang dikomisikan dibuat
                sepenuhnya dari nol.
              </p>
              <p>
                Materi pihak ketiga hanya dapat digunakan apabila House Adel secara wajar memahami
                lisensi atau izin yang berlaku mengizinkan penggunaan yang dimaksud.
              </p>
              <p>
                Apabila sebuah aset, huruf, layanan, model, foto, karya audio atau sumber daya lain
                memerlukan lisensi komersial atau lisensi klien tersendiri, biaya dan persyaratan
                terkait dapat dikomunikasikan kepada klien.
              </p>
              <p>
                Atribusi yang diwajibkan dan melekat pada materi pihak ketiga dapat disertakan
                apabila diperlukan.
              </p>
              <p>
                House Adel memegang kebebasan atas alur kerja produksi internalnya sepanjang hasil
                akhirnya memenuhi persyaratan proyek yang disepakati.
              </p>
            </>
          ),
        },
        {
          id: "client-material",
          title: "10 — Materi yang disediakan klien",
          body: (
            <>
              <p>
                Dengan menyediakan foto, video, musik, huruf, logo, karya seni, teks, merek dagang
                atau materi lain kepada House Adel, klien menyatakan bahwa mereka memiliki materi
                tersebut atau memiliki izin yang memadai untuk menggunakannya bagi proyek ini.
              </p>
              <p>
                Klien tetap bertanggung jawab memperoleh hak dan izin yang sesuai atas materi yang
                mereka sediakan.
              </p>
              <p>
                House Adel dapat menolak menerbitkan atau menggunakan materi yang secara wajar
                diyakininya melanggar hukum, melanggar hak, merugikan, atau tidak pantas bagi proyek
                yang disepakati.
              </p>
              <p>
                House Adel tidak bertanggung jawab atas klaim hak cipta atau kekayaan intelektual
                pihak ketiga yang timbul dari materi yang disediakan atau secara khusus diminta oleh
                klien apabila klien tidak memiliki hak yang diperlukan.
              </p>
              <p>
                Apabila klaim semacam itu diajukan terhadap House Adel, klien akan mengganti biaya
                dan kerugian wajar yang ditanggung House Adel dalam menanganinya, sejauh klaim
                tersebut timbul dari materi yang disediakan atau secara khusus diminta oleh klien
                tanpa memiliki hak yang diperlukan.
              </p>
            </>
          ),
        },
        {
          id: "ownership",
          title: "11 — Kekayaan intelektual dan kepemilikan",
          body: (
            <>
              <p>
                Sampai pembayaran penuh diterima, House Adel mempertahankan hak atas pekerjaan
                komisi yang belum dibayar sejauh diizinkan oleh hukum yang berlaku dan perjanjian
                proyek terkait.
              </p>
              <p>
                Setelah pembayaran penuh, klien menerima hak atas situs akhir yang dikomisikan dan
                desain khusus akhir sebagaimana ditetapkan dalam perjanjian proyek yang berlaku.
              </p>
              <p>
                Klien tetap memiliki nama, merek dagang, foto, naskah, karya seni dan materi klien
                lain yang telah dimilikinya sebelumnya.
              </p>
              <p>
                Kecuali dialihkan secara khusus dan tertulis, House Adel tetap memiliki kekayaan
                intelektualnya yang telah ada sebelumnya serta metode, sistem, komponen, alat,
                teknik, alur kerja, pengetahuan praktis, utilitas kode, teknik animasi dan materi
                lain yang dapat digunakan kembali secara independen dari komposisi khusus akhir
                milik klien.
              </p>
              <p>
                Pengalihan sebuah desain yang dikomisikan tidak memberi klien kepemilikan eksklusif
                atas teknik desain umum, metode pemrograman, prinsip animasi atau proses
                pengembangan.
              </p>
              <p>
                House Adel tidak akan dengan sengaja menjual kembali komposisi akhir khusus milik
                klien lain sebagai komisi khusus yang baru.
              </p>
              <p>
                Kode sumber dapat diberikan kepada klien atas permintaan setelah pembayaran penuh,
                dengan tunduk pada lisensi pihak ketiga dan perjanjian khusus proyek.
              </p>
              <p>
                Setelah serah terima, klien dapat mengubah atau meminta pihak lain mengubah situs
                mereka. House Adel tidak bertanggung jawab atas cacat, kerusakan atau ketidaksesuaian
                yang timbul dari perubahan yang dilakukan klien atau pihak lain setelah serah terima.
              </p>
            </>
          ),
        },
        {
          id: "portfolio",
          title: "12 — Portofolio dan publikasi",
          body: (
            <>
              <p>
                Kecuali kerahasiaan telah disepakati, House Adel dapat mendokumentasikan pekerjaan
                yang telah selesai untuk portofolio, kajian, studi kasus, media sosial, presentasi
                dan materi promosinya.
              </p>
              <p>
                Hal ini dapat mencakup tangkapan layar tidak sensitif, rekaman layar, deskripsi
                proyek, dan, apabila sesuai, identitas publik klien, merek atau acara.
              </p>
              <p>
                Untuk situs yang memang ditujukan untuk publik, House Adel sesekali dapat menautkan
                ke situs langsungnya apabila sesuai.
              </p>
              <p>
                House Adel tidak akan dengan sengaja menerbitkan informasi tamu yang bersifat privat,
                rincian kontak privat, jawaban kuesioner yang bersifat rahasia, alamat privat atau
                informasi pribadi sensitif lainnya semata-mata untuk keperluan portofolio.
              </p>
              <p>
                Situs acara privat umumnya tidak akan ditautkan secara publik dari portofolio House
                Adel.
              </p>
              <p>
                Klien dapat meminta penghapusan tautan langsung yang bersifat publik atau materi
                sensitif/pribadi.
              </p>
              <p>
                Kecuali kerahasiaan penuh telah disepakati secara terpisah, House Adel dapat
                menyimpan tangkapan layar, rekaman dan dokumentasi karya desainnya yang tidak
                sensitif untuk keperluan arsip, kajian dan portofolio.
              </p>
              <p>
                Klausul ini tetap berlaku setelah sebuah proyek selesai atau berakhir dengan cara
                lain, dengan tunduk pada hak klien berdasarkan klausul ini untuk meminta penghapusan
                tautan langsung yang bersifat publik atau materi sensitif maupun pribadi.
              </p>
              <p>
                Klien yang memerlukan kerahasiaan penuh sebaiknya menyampaikan kebutuhan tersebut
                agar dapat disepakati secara tegas.
              </p>
            </>
          ),
        },
        {
          id: "credit",
          title: "13 — Kredit situs",
          body: (
            <>
              <p>
                House Adel tidak mensyaratkan tanda air yang terlihat atau kredit desain publik pada
                situs klien yang telah selesai, kecuali disepakati secara terpisah.
              </p>
              <p>Klien dapat mencantumkan kredit House Adel secara sukarela.</p>
              <p>
                House Adel dapat menyertakan atribusi pengembangan yang tidak terlihat dan wajar
                apabila sesuai, sepanjang hal itu tidak mengganggu situs, tidak mengungkap informasi
                rahasia, dan tidak menyesatkan mengenai kepemilikan.
              </p>
            </>
          ),
        },
        {
          id: "handover",
          title: "14 — Peluncuran, serah terima dan perbaikan bug",
          body: (
            <>
              <p>
                Apabila House Adel mengundang klien secara tertulis untuk meninjau suatu tahap
                pekerjaan atau pekerjaan yang telah selesai, dan tidak ada tanggapan tertulis yang
                diterima dalam sepuluh hari kerja, tahap tersebut dapat diperlakukan sebagai
                disetujui agar proyek dapat berlanjut. Undangan tersebut akan menyatakan hal ini
                pada saat dikirimkan.
              </p>
              <p>
                Kecuali disepakati lain, sebuah komisi dianggap telah diserahkan ketika pekerjaan
                akhir yang telah disetujui diluncurkan, dialihkan atau dengan cara lain disediakan
                kepada klien setelah pembayaran penuh.
              </p>
              <p>
                House Adel menyediakan masa 14 hari kalender setelah penyerahan untuk perbaikan cacat
                teknis yang dapat direproduksi, yang disebabkan House Adel dan berkaitan dengan
                lingkup yang telah diserahkan sesuai kesepakatan.
              </p>
              <p>
                Cacat teknis berarti fungsi yang telah diserahkan secara material tidak berperilaku
                sebagaimana disepakati.
              </p>
              <p>Masa perbaikan tidak mencakup:</p>
              <ul>
                <li>fitur baru;</li>
                <li>permintaan desain baru;</li>
                <li>konten baru;</li>
                <li>revisi tambahan;</li>
                <li>perubahan atas pekerjaan yang sebelumnya telah disetujui;</li>
                <li>masalah yang disebabkan perubahan oleh klien;</li>
                <li>masalah yang disebabkan perubahan oleh pihak ketiga;</li>
                <li>perubahan peramban atau sistem operasi di masa mendatang;</li>
                <li>perubahan atau penghentian layanan pihak ketiga;</li>
                <li>integrasi baru;</li>
                <li>pembaruan konten yang berkelanjutan.</li>
              </ul>
              <p>
                House Adel dapat secara sukarela membantu hal-hal kecil di luar definisi ini, tetapi
                bantuan tersebut tidak menciptakan kewajiban pemeliharaan yang berkelanjutan.
              </p>
              <p>
                Setelah masa perbaikan berakhir, pekerjaan selanjutnya dapat ditawarkan secara
                terpisah apabila House Adel bersedia mengerjakannya.
              </p>
            </>
          ),
        },
        {
          id: "maintenance",
          title: "15 — Pemeliharaan",
          body: (
            <>
              <p>
                Pemeliharaan berkelanjutan tidak termasuk dalam komisi standar House Adel kecuali
                disepakati secara tegas.
              </p>
              <p>
                House Adel tidak menjamin pemeliharaan, pembaruan atau dukungan teknis tanpa batas
                waktu untuk situs yang telah selesai.
              </p>
              <p>
                Mantan klien dapat menghubungi House Adel untuk pekerjaan di masa mendatang. House
                Adel dapat menerima atau menolak pekerjaan tersebut dan memberikan penawaran baru
                berdasarkan kebutuhan dan ketersediaan pada saat itu.
              </p>
            </>
          ),
        },
        {
          id: "cancellation",
          title: "16 — Pembatalan oleh klien",
          body: (
            <>
              <p>Klien dapat mengajukan pembatalan komisi secara tertulis.</p>
              <p>
                Apabila pembatalan terjadi dalam tujuh hari kalender pertama setelah pembayaran awal
                dan sebelum pekerjaan substansial dimulai, pengembalian dana akan memperhitungkan
                pekerjaan yang telah dilakukan serta biaya pihak ketiga yang tidak dapat
                dikembalikan dan telah dikeluarkan khusus untuk proyek tersebut.
              </p>
              <p>
                Setelah masa itu, atau setelah pekerjaan substansial dimulai, pembayaran awal tidak
                dapat dikembalikan sejauh diizinkan hukum yang berlaku, karena pembayaran tersebut
                mengganti pekerjaan yang telah dilakukan dan waktu produksi yang telah dicadangkan
                untuk komisi itu dan dilepaskan terlambat sehingga tidak dapat diberikan kepada
                proyek lain.
              </p>
              <p>
                Pembatalan dengan sendirinya tidak membuat 50% pembayaran akhir yang belum dibayar
                menjadi jatuh tempo. Klien tetap bertanggung jawab atas pekerjaan yang telah
                dilakukan secara patut sampai tanggal pembatalan, serta atas pekerjaan tambahan atau
                biaya pihak ketiga yang telah disetujui secara terpisah dan telah dikeluarkan.
                Apabila nilai pekerjaan tersebut melampaui pembayaran awal, House Adel dapat
                menagihkan selisihnya, sampai dengan tetapi tidak pernah melebihi total biaya yang
                disepakati.
              </p>
              <p>
                Konsep dan pekerjaan yang belum selesai dan belum dialihkan kepada klien tetap
                menjadi milik House Adel kecuali disepakati lain.
              </p>
              <p>
                Hak menurut undang-undang yang tidak dapat dikesampingkan secara sah tetap tidak
                terpengaruh.
              </p>
            </>
          ),
        },
        {
          id: "termination",
          title: "17 — Pengakhiran oleh House Adel",
          body: (
            <>
              <p>
                House Adel dapat mengakhiri atau menangguhkan sebuah komisi apabila secara wajar
                diperlukan karena keadaan serius, termasuk tunggakan pembayaran yang material,
                permintaan yang melanggar hukum, perilaku kasar atau mengancam, atau pelanggaran
                material atas ketentuan proyek yang disepakati.
              </p>
              <p>
                Apabila pengakhiran terjadi karena pelanggaran material oleh klien, biaya yang telah
                diterima tidak dapat dikembalikan sejauh diizinkan hukum yang berlaku, dan pekerjaan
                yang telah dilakukan secara patut namun belum difakturkan tetap dapat ditagihkan.
              </p>
              <p>
                Apabila House Adel memilih mengakhiri proyek atas alasannya sendiri dan klien tidak
                melakukan pelanggaran material atas perjanjian, House Adel akan mengembalikan biaya
                yang telah diterima untuk pekerjaan yang tidak akan diserahkan, dengan perlakuan
                khusus atas pekerjaan yang telah selesai dan pengeluaran pihak ketiga yang telah
                disetujui ditentukan secara adil sesuai keadaan dan perjanjian yang berlaku.
              </p>
              <p>
                Pengakhiran tidak memengaruhi hak atau kewajiban yang telah timbul sebelum
                pengakhiran.
              </p>
            </>
          ),
        },
        {
          id: "third-party-services",
          title: "18 — Layanan pihak ketiga",
          body: (
            <>
              <p>Situs dapat bergantung pada infrastruktur dan layanan pihak ketiga.</p>
              <p>
                House Adel tidak bertanggung jawab atas gangguan, insiden keamanan, perubahan
                kebijakan, penghentian, pembatasan akun, perubahan harga atau kegagalan lain yang
                disebabkan penyedia pihak ketiga di luar kendali wajar House Adel.
              </p>
              <p>
                Jika sebuah integrasi pihak ketiga berubah atau berhenti berfungsi setelah
                penyerahan, menyesuaikan situs dapat memerlukan pekerjaan yang dikomisikan secara
                terpisah kecuali telah tercakup dalam sebuah perjanjian.
              </p>
              <p>
                Apabila secara teknis diperlukan, House Adel dapat merekomendasikan atau mengusulkan
                penyedia alternatif. Setiap perubahan yang secara material memengaruhi biaya,
                kepemilikan atau pemrosesan data klien akan dikomunikasikan sebelum penerapan
                sepanjang secara wajar dimungkinkan.
              </p>
            </>
          ),
        },
        {
          id: "hosting",
          title: "19 — Hosting, domain dan ketersediaan situs",
          body: (
            <>
              <p>
                Kecuali disepakati lain, klien bertanggung jawab memelihara dan membayar layanan yang
                diperlukan agar situs mereka tetap daring, termasuk perpanjangan domain dan hosting
                yang berlaku.
              </p>
              <p>
                House Adel tidak menjamin sebuah situs akan tetap daring tanpa batas waktu apabila
                layanan pihak ketiga yang diperlukan tidak lagi dipelihara atau dibayar.
              </p>
              <p>
                Untuk situs pernikahan dan acara privat, ketentuan bawaannya dapat berupa situs tetap
                tersedia selama layanan yang diperlukannya masih aktif, kecuali klien meminta situs
                itu diarsipkan atau dihapus.
              </p>
              <p>
                Klien dapat meminta House Adel membantu menonaktifkan sebuah situs selama House Adel
                masih memiliki akses yang diperlukan, tetapi House Adel tidak menjamin akses
                administratif permanen setelah serah terima.
              </p>
              <p>
                House Adel dapat menyimpan catatan desain non-pribadi untuk keperluan arsip,
                portofolio dan kajian yang sah. Penanganan informasi pribadi diatur secara terpisah
                oleh{" "}
                <Link to="/privacy" data-sonic>Kebijakan Privasi House Adel</Link>.
              </p>
            </>
          ),
        },
        {
          id: "cms",
          title: "20 — CMS, publikasi dan konten yang dikelola klien",
          body: (
            <>
              <p>
                Apabila House Adel menyediakan antarmuka manajemen konten atau mengintegrasikan
                sistem publikasi pihak ketiga, konten yang diterbitkan klien setelah serah terima
                tetap menjadi tanggung jawab klien.
              </p>
              <p>
                House Adel tidak menjadi penerbit, penyunting atau pemilik konten yang dibuat klien
                semata-mata karena House Adel merancang atau mengembangkan situs tersebut.
              </p>
              <p>
                Masalah yang timbul dari konten buatan klien, unggahan yang tidak sesuai, perubahan
                oleh klien atau penyalahgunaan sistem manajemen konten dapat memerlukan pekerjaan
                yang dikomisikan secara terpisah untuk diperbaiki.
              </p>
            </>
          ),
        },
        {
          id: "results",
          title: "21 — Tidak ada jaminan hasil komersial",
          body: (
            <>
              <p>
                House Adel tidak menjamin hasil komersial, promosi atau audiens tertentu dari sebuah
                situs yang dikomisikan.
              </p>
              <p>Hal ini mencakup, tanpa terbatas pada, jaminan mengenai:</p>
              <ul>
                <li>penjualan;</li>
                <li>trafik;</li>
                <li>peringkat pencarian;</li>
                <li>jumlah RSVP;</li>
                <li>tingkat konversi;</li>
                <li>pengikut;</li>
                <li>liputan media;</li>
                <li>keterlibatan;</li>
                <li>pendapatan usaha.</li>
              </ul>
              <p>
                Kewajiban House Adel adalah menyediakan hasil kerja kreatif dan teknis yang
                disepakati, bukan menjamin bagaimana audiens atau pasar menanggapinya.
              </p>
            </>
          ),
        },
        {
          id: "compatibility",
          title: "22 — Kompatibilitas teknis",
          body: (
            <>
              <p>
                House Adel berupaya menyediakan pengalaman yang berfungsi pada peramban dan perangkat
                kontemporer yang wajar dan sesuai dengan proyeknya.
              </p>
              <p>
                House Adel tidak menjamin kompatibilitas dengan setiap peramban, perangkat, sistem
                operasi atau lingkungan pihak ketiga yang lama, dimodifikasi, tidak didukung atau
                akan datang.
              </p>
              <p>
                Pengalaman interaktif dan yang secara teknis kompleks dapat berbeda secara wajar
                antara perangkat desktop dan seluler karena alasan yang mencakup performa,
                aksesibilitas, metode masukan dan kemampuan perangkat keras.
              </p>
            </>
          ),
        },
        {
          id: "liability",
          title: "23 — Tanggung jawab dan penggunaan Ketentuan ini secara wajar",
          body: (
            <>
              <p>
                Tidak ada satu pun dalam Ketentuan ini yang mengesampingkan atau membatasi hak atau
                tanggung jawab yang tidak dapat dikesampingkan secara sah menurut hukum yang berlaku.
              </p>
              <p>
                House Adel tidak bertanggung jawab atas kerugian tidak langsung atau kegagalan yang
                timbul semata-mata dari keadaan di luar kendali wajarnya, layanan pihak ketiga,
                informasi atau materi yang disediakan klien, atau perubahan yang dilakukan setelah
                serah terima oleh pihak selain House Adel.
              </p>
              <p>
                Dengan tunduk pada paragraf di atas mengenai hak yang tidak dapat dikesampingkan
                secara sah, total tanggung jawab House Adel yang timbul dari atau sehubungan dengan
                sebuah komisi dibatasi sebesar biaya yang benar-benar telah dibayarkan klien untuk
                komisi tersebut. Batas itu tidak berlaku bagi kewajiban klien sendiri untuk membayar
                biaya yang telah jatuh tempo secara patut.
              </p>
              <p>
                Setiap pembatasan tanggung jawab dalam Ketentuan ini hanya boleh ditafsirkan sejauh
                diizinkan oleh hukum yang berlaku.
              </p>
            </>
          ),
        },
        {
          id: "eligibility",
          title: "24 — Kelayakan dan kecakapan hukum",
          body: (
            <>
              <p>
                Orang yang mengikatkan diri dalam komisi berbayar harus memiliki kecakapan hukum
                untuk membuat perjanjian yang bersangkutan.
              </p>
              <p>
                Apabila calon klien tidak memiliki kecakapan hukum yang diperlukan, orang tua, wali
                yang sah atau pihak lain yang berwenang secara hukum harus mengikatkan diri dalam
                perjanjian tersebut apabila disyaratkan.
              </p>
              <p>
                House Adel dapat meminta agar orang dewasa yang sesuai atau perwakilan yang berwenang
                menyetujui komisi tersebut dan melakukan pembayaran apabila diperlukan.
              </p>
            </>
          ),
        },
        {
          id: "law",
          title: "25 — Hukum yang berlaku dan sengketa",
          body: (
            <>
              <p>
                Ketentuan ini dan komisi House Adel tunduk pada hukum Republik Indonesia, kecuali
                apabila hukum yang berlaku secara imperatif menentukan lain.
              </p>
              <p>
                Apabila timbul ketidaksepakatan, House Adel dan klien terlebih dahulu sebaiknya
                berupaya sewajarnya menyelesaikan persoalan tersebut secara langsung dan dengan
                itikad baik.
              </p>
              <p>
                Apabila persoalan tersebut tidak dapat diselesaikan secara informal, para pihak dapat
                menempuh upaya hukum yang tersedia bagi mereka menurut hukum Indonesia yang berlaku
                atau prosedur penyelesaian sengketa yang secara khusus disepakati dalam perjanjian
                proyek yang berlaku.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "26 — Perubahan atas Ketentuan ini",
          body: (
            <>
              <p>House Adel dapat memperbarui Ketentuan situs ini dari waktu ke waktu.</p>
              <p>Tanggal versi terkini akan ditampilkan pada bagian awal halaman ini.</p>
              <p>
                Memperbarui Ketentuan publik tidak secara diam-diam mengubah perjanjian sebuah proyek
                yang telah dikomisikan.
              </p>
              <p>
                Kecuali para pihak secara tegas menyepakati lain, versi Ketentuan ini yang tercakup
                dalam atau dirujuk oleh perjanjian proyek yang telah diterima klien akan tetap
                berlaku bagi proyek tersebut.
              </p>
            </>
          ),
        },
        {
          id: "severability",
          title: "27 — Keterpisahan",
          body: (
            <p>
              Apabila suatu ketentuan dalam Ketentuan ini dinyatakan tidak sah, melanggar hukum atau
              tidak dapat diberlakukan, ketentuan tersebut akan ditafsirkan atau dibatasi sejauh
              diperlukan menurut hukum yang berlaku tanpa secara otomatis membatalkan ketentuan
              lainnya.
            </p>
          ),
        },
        {
          id: "privacy",
          title: "28 — Privasi",
          body: (
            <>
              <p>
                Pengumpulan dan pemrosesan informasi pribadi melalui House Adel diatur oleh{" "}
                <Link to="/privacy" data-sonic>Kebijakan Privasi House Adel</Link> yang terpisah.
              </p>
              <p>
                Kebijakan Privasi tersebut sebaiknya dibaca bersama Ketentuan ini sepanjang berlaku.
              </p>
            </>
          ),
        },
        {
          id: "contact",
          title: "29 — Kontak",
          body: (
            <>
              <p>
                Pertanyaan mengenai Ketentuan ini atau sebuah komisi House Adel dapat disampaikan
                kepada:
              </p>
              <address className={styles.address}>
                <span>House Adel</span>
                <span>{email}</span>
                <span>Indonesia</span>
              </address>
            </>
          ),
        },
      ];

  return (
    <div className={`${styles.page} page-frame`}>
      <InkText as="h1" id="terms-title" className={styles.heading}>
        {isEnglish
          ? "What a commission commits us both to."
          : "Apa yang mengikat kami dan Anda dalam sebuah komisi."}
      </InkText>
      <p className={styles.updated}>
        {isEnglish ? "Last updated 17 August 2026" : "Terakhir diperbarui 17 Agustus 2026"}
      </p>
      <p className={styles.lede}>
        {isEnglish
          ? "These Terms govern the use of the House Adel website and the commissioning of services from House Adel. By using this website, submitting an inquiry, or entering into a commission with House Adel, you acknowledge these Terms where applicable."
          : "Ketentuan ini mengatur penggunaan situs House Adel dan pemesanan layanan dari House Adel. Dengan menggunakan situs ini, mengirimkan pertanyaan, atau mengikatkan diri dalam sebuah komisi dengan House Adel, Anda mengakui Ketentuan ini sepanjang berlaku."}
      </p>

      <div className={styles.preamble}>
        {isEnglish ? (
          <>
            <p>
              House Adel is an independent creative web studio operating from Indonesia. Specific
              commissioned projects may also be governed by a quotation, proposal, project agreement,
              or other written terms agreed between House Adel and the client.
            </p>
            <p>
              Where project-specific terms conflict with these general Terms, the project-specific
              agreement will govern that project.
            </p>
          </>
        ) : (
          <>
            <p>
              House Adel adalah studio web kreatif independen yang beroperasi dari Indonesia. Proyek
              tertentu yang dikomisikan juga dapat diatur oleh penawaran, proposal, perjanjian
              proyek, atau ketentuan tertulis lain yang disepakati antara House Adel dan klien.
            </p>
            <p>
              Apabila ketentuan khusus proyek bertentangan dengan Ketentuan umum ini, perjanjian
              khusus proyek itulah yang berlaku bagi proyek tersebut.
            </p>
          </>
        )}
      </div>

      <LegalNav
        label={isEnglish ? "Contents" : "Daftar isi"}
        items={sections.map(({ id, title }) => ({ id, title }))}
        anchorPrefix="terms"
        sibling={{
          to: "/privacy",
          label: isEnglish ? "Privacy Policy" : "Kebijakan Privasi",
          description: isEnglish
            ? "What happens to what you send us: what the enquiry form collects, where it goes, and how to ask for it back."
            : "Apa yang terjadi pada yang Anda kirim: apa yang dikumpulkan formulir pertanyaan, ke mana perginya, dan cara memintanya kembali.",
        }}
      />

      <div className={styles.sections}>
        {sections.map((section) => (
          <section key={section.id} className={styles.section} aria-labelledby={`terms-${section.id}`}>
            <h2 id={`terms-${section.id}`}>{section.title}</h2>
            <div className={styles.body}>{section.body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
