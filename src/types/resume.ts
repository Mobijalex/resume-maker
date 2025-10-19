/**
 * Core resume data interfaces
 */

export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
}

export interface WorkExperience {
    jobTitle: string;
    company: string;
    duration: string;
    accomplishments: string[];
    isCurrentRole: boolean;
}

export interface Education {
    degree: string;
    institution: string;
    graduationDate: string;
    gpa?: string;
    relevantCoursework?: string[];
}

export interface Skills {
    technical: string[];
    languages?: string[];
    soft?: string[];
}

export interface Certification {
    name: string;
    issuer: string;
    dateObtained: string;
    expirationDate?: string;
    credentialId?: string;
}

export interface Project {
    name: string;
    description: string;
    technologies: string[];
    duration?: string;
    url?: string;
    accomplishments: string[];
}

export interface ResumeData {
    personalInfo: PersonalInfo;
    summary: string;
    experience: WorkExperience[];
    education: Education[];
    skills: Skills;
    certifications?: Certification[];
    projects?: Project[];
}