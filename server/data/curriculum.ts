export interface CourseModule {
  id: string;
  code: string;
  title: string;
  frameworks: string[];
  documentation: string;
}

export const ACADEMIC_REGISTRY: CourseModule[] = [
  {
    id: "01",
    code: "ARCH-401",
    title: "Structural Compounding and Systemic Mechanics",
    frameworks: ["Discrete Mathematics", "Asymmetric Scaling Models", "Structural Analysis"],
    documentation: "An exhaustive operational deep-dive into the mechanical realities of modern computing infrastructure. Students will map, analyze, and stress-test high-throughput environments through a rigorous, mathematical framework designed to prioritize raw computational efficiency."
  },
  {
    id: "02",
    code: "MATH-502",
    title: "Advanced Quantitative Frameworks & Statistical Paradigms",
    frameworks: ["Stochastic Processes", "Predictive Analytics", "Bayesian Inferences"],
    documentation: "Deconstructing core predictive methodologies. This environment operates purely on practical mathematical application, stripping away superficial abstractions to provide clear, baseline competencies in complex algorithmic logic."
  }
];
