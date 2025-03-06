import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronUp, ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PolicySection = () => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-policy-background">
      <Button
        variant="ghost"
        className="ml-3 mt-5 flex items-center gap-2 hover:bg-green-400"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon width={24} />
        Back
      </Button>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8 animate-fade-in">
          <header className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold text-policy-text">
              FreelancerHub - Company Policies
            </h1>
            <p className="text-policy-muted">Last updated: Feb 2025</p>
          </header>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem
              value="general"
              className="border rounded-lg p-2 shadow-sm"
            >
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                1. General Policies
              </AccordionTrigger>
              <AccordionContent className="text-policy-text space-y-4 pt-4">
                <p>
                  FreelancerHub is a digital marketplace connecting clients and
                  freelancers for project-based work.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Both clients and freelancers must comply with these policies
                    to ensure a safe and trustworthy platform.
                  </li>
                  <li>
                    We reserve the right to suspend or terminate accounts
                    violating these policies.
                  </li>
                  <li>
                    All financial transactions and communications must be
                    conducted within the FreelancerHub platform.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="clients"
              className="border rounded-lg p-2 shadow-sm"
            >
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                2. Policies for Clients
              </AccordionTrigger>
              <AccordionContent className="text-policy-text space-y-6 pt-4">
                <div>
                  <h3 className="font-semibold mb-3">
                    Project Posting & Management
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Clients can post projects and set budgets for freelancers
                      to bid on.
                    </li>
                    <li>
                      Clients can edit or delete projects if no freelancer is
                      assigned.
                    </li>
                    <li>
                      Once a freelancer is assigned, the project cannot be
                      deleted unless the freelancer agrees.
                    </li>
                    <li>
                      Deposited funds will remain in escrow until project
                      completion.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Payments & Refunds</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Clients must deposit the full project amount into escrow
                      before a freelancer starts working.
                    </li>
                    <li>
                      Funds are held securely until the client clicks "Release
                      Payment."
                    </li>
                    <li>
                      Once payment is released, it will take upto 24 hours to
                      reflect in the freelancer's account.
                    </li>
                    <li>
                      If a project is deleted before assigning a freelancer, the
                      full deposited amount is refunded to the client's bank
                      account.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Dispute Resolution</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      If a project is not completed as agreed, clients can open
                      a dispute.
                    </li>
                    <li>
                      FreelancerHub will review disputes and may request proof
                      (messages, work samples, etc.).
                    </li>
                    <li>
                      If the dispute is resolved in favor of the client, funds
                      will be refunded.
                    </li>
                    <li>
                      If the dispute is resolved in favor of the freelancer,
                      funds will be released to them.
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="freelancers"
              className="border rounded-lg p-2 shadow-sm"
            >
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                3. Policies for Freelancers
              </AccordionTrigger>
              <AccordionContent className="text-policy-text space-y-6 pt-4">
                <div>
                  <h3 className="font-semibold mb-3">
                    Bidding & Project Completion
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Freelancers can bid on projects that match their skills.
                    </li>
                    <li>
                      Once assigned, freelancers must complete the project as
                      per the agreement.
                    </li>
                    <li>
                      If a freelancer fails to deliver, the client may report or
                      dispute the transaction.
                    </li>
                    <li>
                      Freelancers cannot request payments outside FreelancerHub;
                      doing so will result in account suspension.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Payment & Withdrawals</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      After the client clicks "Release Payment," the amount will
                      take 24 hours to reflect in the freelancer's account.
                    </li>
                    <li>
                      Freelancers can withdraw funds only to their verified bank
                      or payment account.
                    </li>
                    <li>
                      Minimum withdrawal amount: ₹500 (as per platform policy).
                    </li>
                    <li>
                      If a withdrawal request fails due to incorrect details,
                      the funds will be returned to the freelancer's wallet.
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="integrity"
              className="border rounded-lg p-2 shadow-sm"
            >
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                4. Platform Integrity & Trust
              </AccordionTrigger>
              <AccordionContent className="text-policy-text space-y-4 pt-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    No external transactions – all payments and contracts must
                    stay within FreelancerHub.
                  </li>
                  <li>
                    Data Privacy – FreelancerHub ensures secure storage of
                    personal and payment information.
                  </li>
                  <li>
                    Fair Work Practices – Disputes will be reviewed objectively
                    to protect both parties.
                  </li>
                  <li>
                    Anti-Fraud Measures – Fake projects, fake freelancer
                    profiles, and fraudulent activities will lead to permanent
                    bans.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="support"
              className="border rounded-lg p-2 shadow-sm"
            >
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                5. Support & Assistance
              </AccordionTrigger>
              <AccordionContent className="text-policy-text space-y-4 pt-4">
                <p>
                  FreelancerHub provides customer support for any payment,
                  project, or dispute-related issues.
                </p>
                <div className="bg-policy-accent/10 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Contact Information:</p>
                  <ul className="space-y-2">
                    <li>Raise a dispute ticket</li>
                    <li>
                      FreelancerHub strives for 99.9% uptime, but occasional
                      maintenance may occur.{" "}
                    </li>
                    <li>
                      Users will be notified in advance of any scheduled
                      maintenance affecting transactions.
                    </li>{" "}
                    <li>
                      {" "}
                      FreelancerHub is not liable for losses due to unexpected
                      downtime or third-party service failures
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <Button
          variant="outline"
          size="icon"
          className={`fixed bottom-8 right-8 rounded-full shadow-lg transition-opacity duration-300 ${
            showScrollTop ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={scrollToTop}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PolicySection;
