export type TSAStatus = "completed" | "partial" | "needs_input";
export type TSAPriority = "P0" | "P1" | "P2" | "P3";
export interface TrustAuditInput {
    url?: string;
    html?: string;
    page?: {
        url?: string;
        pageType?: "homepage" | "service" | "product" | "blog" | "article" | "local" | "ecommerce" | "pricing" | "contact" | "about" | "legal" | "unknown";
        title?: string;
        bodyText?: string;
        isYMYL?: boolean;
        claims?: string[];
    };
    organization?: {
        name?: string;
        url?: string;
        description?: string;
        address?: Record<string, unknown>;
        phone?: string;
        email?: string;
        sameAs?: string[];
        foundingDate?: string;
        teamVisible?: boolean;
    };
    authors?: Array<{
        name: string;
        url?: string;
        bio?: string;
        jobTitle?: string;
        credentials?: string[];
        sameAs?: string[];
    }>;
    reviewers?: Array<{
        name: string;
        url?: string;
        bio?: string;
        credentials?: string[];
    }>;
    trustPages?: {
        aboutUrl?: string;
        contactUrl?: string;
        privacyPolicyUrl?: string;
        termsUrl?: string;
        refundPolicyUrl?: string;
        shippingPolicyUrl?: string;
        cookiePolicyUrl?: string;
        securityUrl?: string;
    };
    testimonials?: Array<{
        name?: string;
        text?: string;
        rating?: number;
        source?: string;
        isVerified?: boolean;
    }>;
    caseStudies?: Array<{
        title?: string;
        url?: string;
        clientName?: string;
        result?: string;
    }>;
    mode?: "trust" | "eeat" | "policy" | "audit";
}
export interface SecurityAuditInput {
    url?: string;
    html?: string;
    headers?: Record<string, string | undefined>;
    page?: {
        url?: string;
        statusCode?: number;
        usesHttps?: boolean;
        hasForms?: boolean;
        formCount?: number;
        collectsSensitiveData?: boolean;
    };
    resources?: Array<{
        url: string;
        type?: "script" | "stylesheet" | "image" | "iframe" | "form_action" | "unknown";
        isHttps?: boolean;
        isThirdParty?: boolean;
    }>;
    forms?: Array<{
        action?: string;
        method?: "get" | "post" | "unknown";
        hasCsrfToken?: boolean;
        usesHttps?: boolean;
        fields?: Array<{
            name?: string;
            type?: "text" | "email" | "password" | "phone" | "file" | "hidden" | "checkbox" | "radio" | "textarea" | "unknown";
            label?: string;
            required?: boolean;
        }>;
    }>;
    securitySignals?: {
        malwareFlag?: boolean;
        hackedContentFlag?: boolean;
        spamInjectedContentFlag?: boolean;
        manualActionFlag?: boolean;
    };
    mode?: "security" | "forms" | "headers" | "audit";
}
export interface AccessibilityAuditInput {
    url?: string;
    html?: string;
    page?: {
        url?: string;
        title?: string;
        language?: string;
    };
    headings?: Array<{
        level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        text: string;
    }>;
    images?: Array<{
        src: string;
        alt?: string;
        isDecorative?: boolean;
    }>;
    forms?: Array<{
        id?: string;
        fields?: Array<{
            id?: string;
            name?: string;
            type?: "text" | "email" | "password" | "phone" | "checkbox" | "radio" | "textarea" | "select" | "unknown";
            label?: string;
            ariaLabel?: string;
            placeholder?: string;
            required?: boolean;
        }>;
    }>;
    links?: Array<{
        href: string;
        text?: string;
        ariaLabel?: string;
    }>;
    buttons?: Array<{
        text?: string;
        ariaLabel?: string;
        type?: "button" | "submit" | "reset" | "unknown";
    }>;
    accessibilitySignals?: {
        keyboardTrapsKnown?: boolean;
        lowContrastKnown?: boolean;
        missingLangKnown?: boolean;
        autoplayMediaKnown?: boolean;
    };
    mode?: "accessibility" | "semantic" | "forms" | "audit";
}
export interface TSAIssue {
    id: string;
    category: string;
    title: string;
    priority: TSAPriority;
    problem: string;
    whyItMatters: string;
    howToFix: string;
    do: string[];
    dont: string[];
    evidence: string[];
    appliesTo: Array<"trust" | "eeat" | "security" | "accessibility" | "audit">;
}
export interface TSAOutput {
    skill: "trust-security-accessibility";
    status: TSAStatus;
    score: number;
    summary: string;
    trustFindings: string[];
    eeatFindings: string[];
    securityFindings: string[];
    accessibilityFindings: string[];
    policyFindings: string[];
    issues: TSAIssue[];
    missingInputs: string[];
    nextActions: string[];
}
//# sourceMappingURL=trust-security-accessibility.d.ts.map