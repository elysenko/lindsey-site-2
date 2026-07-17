"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQS = void 0;
exports.faqsForService = faqsForService;
exports.faqCategories = faqCategories;
exports.FAQS = [
    {
        category: 'Brand Positioning',
        serviceSlug: 'brand-positioning',
        question: 'What exactly is brand positioning?',
        answer: 'Positioning is the discipline of choosing the single idea you want to be known for and organizing every decision around it. It determines the ground on which all of your future messaging will stand.',
    },
    {
        category: 'Brand Positioning',
        serviceSlug: 'brand-positioning',
        question: 'How is positioning different from a rebrand?',
        answer: 'A rebrand changes how you look; positioning changes what you mean. Positioning is quieter and more consequential — it defines the strategy that a visual identity should express.',
    },
    {
        category: 'Brand Positioning',
        serviceSlug: 'brand-positioning',
        question: 'How long does a positioning engagement take?',
        answer: 'Most positioning engagements run six to ten weeks, depending on the depth of research required and the number of stakeholders involved in the decision.',
    },
    {
        category: 'Brand Positioning',
        serviceSlug: 'brand-positioning',
        question: 'Who needs to be involved from our side?',
        answer: 'Positioning is a leadership decision. We typically work closely with the founder or CMO and convene a small cross-functional group for key checkpoints.',
    },
    {
        category: 'Narrative & Messaging',
        serviceSlug: 'narrative-strategy',
        question: 'What is a brand narrative?',
        answer: 'A brand narrative is the throughline that connects everything you say. It gives teams a shared story so messaging stays consistent across channels and audiences.',
    },
    {
        category: 'Narrative & Messaging',
        serviceSlug: 'narrative-strategy',
        question: 'How do you keep messaging consistent across teams?',
        answer: 'We build a message architecture — a master narrative plus an audience matrix and voice guidelines — so every team can adapt the message without drifting off-strategy.',
    },
    {
        category: 'Narrative & Messaging',
        serviceSlug: 'narrative-strategy',
        question: 'Do you write the actual copy?',
        answer: 'We produce the strategic messaging and reference copy. Many clients then apply it in-house; we can also partner with your content team to see it through.',
    },
    {
        category: 'Narrative & Messaging',
        serviceSlug: 'narrative-strategy',
        question: 'Can narrative work happen without full positioning?',
        answer: 'It can, but it works best on a settled position. When positioning is unclear we recommend resolving it first so the narrative has firm ground to stand on.',
    },
    {
        category: 'Identity & Design',
        serviceSlug: 'brand-identity',
        question: 'What does an identity system include?',
        answer: 'A complete system covers logo, color, typography, and core templates, documented in guidelines so teams can apply the brand consistently and confidently.',
    },
    {
        category: 'Identity & Design',
        serviceSlug: 'brand-identity',
        question: 'How do you keep a design system from feeling trendy?',
        answer: 'We favor disciplined restraint — distinctive, coherent systems designed to endure. The goal is recognition and longevity, not a look that dates in a year.',
    },
    {
        category: 'Identity & Design',
        serviceSlug: 'brand-identity',
        question: 'Do you handle implementation across our channels?',
        answer: 'We deliver the system and guidelines, and we support rollout — from templates to asset libraries — so the identity is applied correctly everywhere it appears.',
    },
    {
        category: 'Market Intelligence',
        serviceSlug: 'market-intelligence',
        question: 'What kind of research do you run?',
        answer: 'We design competitive landscape analysis and audience research tailored to the decision at hand, translating raw data into decision-grade insight.',
    },
    {
        category: 'Market Intelligence',
        serviceSlug: 'market-intelligence',
        question: 'How does research connect to strategy?',
        answer: 'Research grounds the positioning decision. Every engagement starts from evidence so the strategy we recommend is defensible, not speculative.',
    },
    {
        category: 'Market Intelligence',
        serviceSlug: 'market-intelligence',
        question: 'Can you work with research we already have?',
        answer: 'Yes. We often start by auditing existing studies and data, then fill only the gaps that matter for the decision, which keeps the work efficient.',
    },
    {
        category: 'Working Together',
        question: 'How do we start working with LeBarre Group?',
        answer: 'Begin with a consultation. We use it to understand your situation and challenges, then follow up with a short Brand Intelligence Brief to shape the engagement.',
    },
    {
        category: 'Working Together',
        question: 'What is the Brand Intelligence Brief?',
        answer: 'It is a structured follow-up to your consultation that captures your mission, audiences, and definition of success so our first conversation is already productive.',
    },
    {
        category: 'Working Together',
        question: 'What size organizations do you work with?',
        answer: 'We advise founders, boards, and institutions — from venture-backed startups to century-old organizations — wherever the positioning decision is consequential.',
    },
];
function faqsForService(slug) {
    return exports.FAQS.filter((f) => f.serviceSlug === slug);
}
function faqCategories() {
    return Array.from(new Set(exports.FAQS.map((f) => f.category)));
}
//# sourceMappingURL=faqs.data.js.map