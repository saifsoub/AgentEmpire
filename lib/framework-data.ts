export interface FrameworkComponent {
  id: string;
  name: string;
  description: string;
  principles: string[];
  maturityIndicators: string[];
}

export interface FrameworkPillar {
  id: string;
  name: string;
  tagline: string;
  description: string;
  colorClass: string;
  accentHex: string;
  components: FrameworkComponent[];
}

export interface Framework {
  name: string;
  version: string;
  vision: string;
  pillars: FrameworkPillar[];
}

export const FRAMEWORK: Framework = {
  name: "Human-Centric Digital Resilience Framework",
  version: "1.0",
  vision:
    "Build digital systems that are humane, intelligent, secure, and capable of thriving under adversity — centred on people at every layer.",

  pillars: [
    {
      id: "digital-design",
      name: "Human-Centred Digital Design",
      tagline: "Design for people, not systems",
      description:
        "Craft digital experiences that respect human cognition, emotion, and diversity. Every interface is a relationship between the system and a person.",
      colorClass: "text-blue-400",
      accentHex: "#60a5fa",
      components: [
        {
          id: "ux-research",
          name: "User Experience Research",
          description:
            "Ground every design decision in evidence gathered directly from the people who will use the system.",
          principles: [
            "Observe before you build",
            "Context of use is not optional",
            "Qualitative and quantitative data are complementary",
            "Involve users throughout, not just at launch",
          ],
          maturityIndicators: [
            "Regular usability sessions are scheduled",
            "Research findings feed directly into design backlog",
            "Personas and journey maps are living documents",
          ],
        },
        {
          id: "accessibility",
          name: "Inclusive Accessibility",
          description:
            "Accessibility is a baseline, not a feature. Systems that exclude are systems that fail.",
          principles: [
            "WCAG 2.2 AA as the minimum, not the ceiling",
            "Design for the extremes, benefit the middle",
            "Keyboard and screen-reader parity from day one",
            "Colour is never the only signal",
          ],
          maturityIndicators: [
            "Automated accessibility CI checks pass on every PR",
            "Manual screen-reader testing is part of QA",
            "Accessibility champions exist in each product team",
          ],
        },
        {
          id: "privacy-by-design",
          name: "Privacy by Design",
          description:
            "Privacy is an architectural property, not a compliance checkbox bolted on afterwards.",
          principles: [
            "Collect minimum data — purpose limitation is law",
            "Data subjects control their own records",
            "Defaults protect privacy, opt-in expands it",
            "Transparency is a continuous obligation",
          ],
          maturityIndicators: [
            "Privacy impact assessments run before feature launch",
            "Data retention schedules are enforced programmatically",
            "Consent flows pass independent review",
          ],
        },
        {
          id: "cognitive-load",
          name: "Cognitive Load Management",
          description:
            "Reduce friction so people can act with confidence rather than wrestle with complexity.",
          principles: [
            "Progressive disclosure over information dumps",
            "Defaults do the right thing for most people",
            "Error messages name the problem and the fix",
            "Interfaces age well as users build mental models",
          ],
          maturityIndicators: [
            "Task completion rates are tracked per journey",
            "Error rates surface in team dashboards",
            "A/B tests validate load-reduction changes",
          ],
        },
      ],
    },
    {
      id: "responsible-ai",
      name: "Responsible Artificial Intelligence",
      tagline: "Intelligence with accountability",
      description:
        "AI that is explainable, fair, and governed. Automation should augment human judgement — never silently replace it on consequential decisions.",
      colorClass: "text-purple-400",
      accentHex: "#c084fc",
      components: [
        {
          id: "explainability",
          name: "Explainability & Transparency",
          description:
            "Every AI output that affects a person must come with a reason they can understand and contest.",
          principles: [
            "Black-box outputs on high-stakes decisions are prohibited",
            "Explanations are written for the affected person, not the engineer",
            "Model confidence is communicated alongside results",
            "Audit trails are immutable and readily accessible",
          ],
          maturityIndicators: [
            "All production models have an explanation method attached",
            "Explanation quality is user-tested, not assumed",
            "Model cards are published for every deployed system",
          ],
        },
        {
          id: "bias-fairness",
          name: "Fairness & Bias Mitigation",
          description:
            "AI systems inherit human bias from data. Proactive measurement and correction are non-negotiable.",
          principles: [
            "Define fairness criteria before training, not after audit",
            "Disaggregated performance metrics are standard",
            "Bias is a continuous risk, not a one-time check",
            "Feedback loops that amplify bias are actively broken",
          ],
          maturityIndicators: [
            "Fairness dashboards are maintained for live models",
            "Demographic performance gaps trigger automatic review",
            "Third-party bias audits occur at least annually",
          ],
        },
        {
          id: "human-oversight",
          name: "Human-in-the-Loop Oversight",
          description:
            "Consequential automated decisions require a human checkpoint. Approval gates are not bureaucracy — they are trust infrastructure.",
          principles: [
            "Irreversible actions always require explicit human sign-off",
            "Overrides are logged and reviewed",
            "Escalation paths are well-defined and tested",
            "Automation confidence thresholds are set by policy, not convenience",
          ],
          maturityIndicators: [
            "Approval gate coverage matches risk classification",
            "Override rate is monitored as a quality signal",
            "Humans can halt any automated workflow in under 30 seconds",
          ],
        },
        {
          id: "ai-governance",
          name: "AI Governance",
          description:
            "Structured accountability for every model in production: who owns it, how it is monitored, and what happens when it fails.",
          principles: [
            "Every model has a named owner accountable for outcomes",
            "Governance applies from prototyping through decommission",
            "Incidents are disclosed promptly and transparently",
            "Ethics review is part of the development lifecycle",
          ],
          maturityIndicators: [
            "AI asset register is maintained and current",
            "Model performance reviews are scheduled quarterly",
            "AI ethics committee or equivalent body is active",
          ],
        },
      ],
    },
    {
      id: "cybersecurity",
      name: "Cybersecurity",
      tagline: "Defend by design, respond by default",
      description:
        "Security is a property of the whole system, not a perimeter. Assume breach, reduce blast radius, recover fast.",
      colorClass: "text-red-400",
      accentHex: "#f87171",
      components: [
        {
          id: "zero-trust",
          name: "Zero Trust Architecture",
          description:
            "Never trust by default. Verify every identity, device, and request continuously regardless of network location.",
          principles: [
            "Verify explicitly — authenticate and authorise every request",
            "Use least privilege — minimum access for minimum duration",
            "Assume breach — limit blast radius, segment everything",
            "Continuous verification, not perimeter trust",
          ],
          maturityIndicators: [
            "MFA enforced for all privileged access",
            "Micro-segmentation applied to critical systems",
            "Identity-based access controls replace network-based trust",
          ],
        },
        {
          id: "threat-intelligence",
          name: "Threat Intelligence",
          description:
            "Understand the threat landscape relevant to your systems and act on intelligence before incidents occur.",
          principles: [
            "Intelligence is only useful when actionable",
            "Threat models are reviewed after every significant change",
            "Sharing intelligence with peers strengthens the whole ecosystem",
            "Indicators of compromise are operationalised, not filed away",
          ],
          maturityIndicators: [
            "Threat intelligence feeds integrated into SIEM",
            "Threat model reviews are part of the design process",
            "Red team exercises run at least annually",
          ],
        },
        {
          id: "incident-response",
          name: "Incident Response",
          description:
            "A practiced, documented response capability reduces the cost of every breach. Slow responders pay more — in time, money, and trust.",
          principles: [
            "Detect faster than attackers can pivot",
            "Contain before you investigate",
            "Communicate early, even when facts are incomplete",
            "Post-incident review is blameless and systematic",
          ],
          maturityIndicators: [
            "IR playbooks exist for top-10 scenario types",
            "Tabletop exercises are run quarterly",
            "Mean time to detect and contain are tracked metrics",
          ],
        },
        {
          id: "secure-development",
          name: "Secure Development",
          description:
            "Security defects discovered in production cost ten times more than those caught at design. Shift left — permanently.",
          principles: [
            "Threat modelling is a design activity, not a review",
            "SAST and dependency scanning block every merge",
            "Security requirements are written alongside functional requirements",
            "Developer security training is continuous, not annual",
          ],
          maturityIndicators: [
            "SAST integrated in CI/CD pipeline",
            "Critical or high findings block deployment",
            "Security champions embedded in product teams",
          ],
        },
      ],
    },
    {
      id: "business-resilience",
      name: "Business Resilience",
      tagline: "Bend without breaking",
      description:
        "Organisations that plan for disruption absorb it. Build adaptive capacity across risk management, continuity, and culture so the enterprise keeps running when conditions change.",
      colorClass: "text-emerald-400",
      accentHex: "#34d399",
      components: [
        {
          id: "risk-management",
          name: "Enterprise Risk Management",
          description:
            "Identify, measure, and govern risks before they become crises. Risk appetite is a leadership decision, not a technical one.",
          principles: [
            "Risk registers are living documents, not compliance artefacts",
            "Risk appetite is set explicitly and communicated clearly",
            "Emerging risks are captured before they materialise",
            "Risk owners are accountable, not just informed",
          ],
          maturityIndicators: [
            "Risk register reviewed and updated monthly",
            "Top-10 risks have named owners and mitigation plans",
            "Risk appetite statements approved by leadership",
          ],
        },
        {
          id: "business-continuity",
          name: "Business Continuity",
          description:
            "Keep critical services running through disruptions. Recovery objectives are meaningless without tested plans.",
          principles: [
            "RTO and RPO are business decisions, not IT estimates",
            "Untested plans are not plans — exercise regularly",
            "Dependencies (third-party, cloud, people) are mapped and backed up",
            "Communication during outages is pre-scripted and accessible",
          ],
          maturityIndicators: [
            "BCP tested end-to-end at least annually",
            "RTOs achieved during test exercises",
            "Critical supplier continuity plans reviewed yearly",
          ],
        },
        {
          id: "adaptive-strategy",
          name: "Adaptive Strategy",
          description:
            "Strategy is a hypothesis. Build the capability to sense change and update the plan without losing momentum.",
          principles: [
            "Strategic plans include explicit trigger conditions for revision",
            "Weak signals from the market reach decision-makers quickly",
            "Experimentation capacity is budgeted, not fought for",
            "Learning from failure is a cultural norm, not a post-mortem ritual",
          ],
          maturityIndicators: [
            "Strategy reviewed and updated quarterly",
            "Innovation experiments track learning metrics, not just ROI",
            "Leadership teams practice scenario planning",
          ],
        },
        {
          id: "crisis-communications",
          name: "Crisis Communications",
          description:
            "How you communicate in a crisis is as important as how you respond. Silence and spin both destroy trust.",
          principles: [
            "Communicate early, even with incomplete information",
            "One voice, one message — designate spokesperson in advance",
            "Honesty is the only long-term strategy",
            "Stakeholder mapping determines who hears what, when",
          ],
          maturityIndicators: [
            "Crisis comms playbook exists and is reviewed annually",
            "Spokesperson trained and designated per scenario type",
            "Media and stakeholder response templates are ready to use",
          ],
        },
      ],
    },
  ],
};

export function listPillars(fw: Framework = FRAMEWORK) {
  return fw.pillars.map(p => ({ id: p.id, name: p.name, tagline: p.tagline, componentCount: p.components.length }));
}

export function getPillarById(id: string, fw: Framework = FRAMEWORK): FrameworkPillar | undefined {
  return fw.pillars.find(p => p.id === id);
}
