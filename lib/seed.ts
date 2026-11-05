import type { Store } from "@/lib/types";

const readingPassage = `City libraries are changing how they measure success. For most of the last century, a library counted the books it owned and the number of people who walked through the door. Those numbers are still collected, but they miss a large part of the work. A student may download a journal at midnight, a parent may join an online reading group, and a new resident may use a language workstation that never appears in a footfall count.

In 2024, the Eastbridge library network replaced its old monthly report with three measures: visits, digital loans, and completed learning sessions. The third measure counts a person only when they finish a class, a workshop, or a guided research appointment. The change was unpopular with one branch, whose visits had fallen after a nearby metro station closed. Its digital loans, however, had doubled, and its learning sessions had grown by a third. Under the new report, that branch was no longer described as being in decline.

Critics say a finished session is a narrow idea of learning. A reader who spends an afternoon in the stacks and leaves with nothing checked out is invisible. Supporters answer that no single measure is complete, and that the point of publishing three numbers is to stop any one of them from standing in for the whole library.`;

export const SEED: Store = {
  subjects: [
    {
      id: "sub_nuet",
      slug: "nuet",
      name: "NUET",
      description: "Nazarbayev University Entrance Test",
      position: 0,
    },
    {
      id: "sub_ielts",
      slug: "ielts",
      name: "IELTS",
      description: "International English Language Testing System",
      position: 1,
    },
  ],
  tests: [
    {
      id: "test_nuet_math",
      subjectId: "sub_nuet",
      slug: "nuet-math",
      title: "NUET Math",
      description: "A short multiple-choice math set.",
      passage: null,
      position: 0,
      published: true,
    },
    {
      id: "test_nuet_crit",
      subjectId: "sub_nuet",
      slug: "nuet-crit",
      title: "NUET Crit",
      description: "Arguments, assumptions, and what follows.",
      passage: null,
      position: 1,
      published: true,
    },
    {
      id: "test_nuet_full",
      subjectId: "sub_nuet",
      slug: "nuet-full",
      title: "NUET Full",
      description: "A short mix of math and critical thinking.",
      passage: null,
      position: 2,
      published: true,
    },
    {
      id: "test_ielts_reading",
      subjectId: "sub_ielts",
      slug: "ielts-reading",
      title: "IELTS Reading",
      description: "One passage and four questions.",
      passage: readingPassage,
      position: 0,
      published: true,
    },
    {
      id: "test_ielts_full",
      subjectId: "sub_ielts",
      slug: "ielts-full",
      title: "IELTS Full",
      description: "A short mixed English paper.",
      passage: null,
      position: 1,
      published: true,
    },
  ],
  questions: [
    q("test_nuet_math", 0, "If 3x + 7 = 22, what is the value of x?", ["3", "4", "5", "15"], 2, "Subtract 7 from both sides to get 3x = 15, then divide by 3."),
    q("test_nuet_math", 1, "A line passes through (1, 2) and (4, 11). What is its slope?", ["2", "3", "9/5", "13/5"], 1, "Slope is the change in y divided by the change in x: (11 - 2) / (4 - 1) = 3."),
    q("test_nuet_math", 2, "A square has area 49. What is its perimeter?", ["14", "21", "28", "49"], 2, "The side is the square root of 49, which is 7. The perimeter is 4 times 7, so 28."),
    q("test_nuet_math", 3, "Which expression is equal to 2^5 times 2^3?", ["2^8", "2^15", "4^8", "2^2"], 0, "When multiplying powers with the same base, add the exponents: 5 + 3 = 8."),
    q("test_nuet_math", 4, "A price increases by 20%, then decreases by 20%. The final price is what percent of the original price?", ["96%", "100%", "104%", "80%"], 0, "1.20 times 0.80 is 0.96, so the price ends at 96% of the original."),
    q("test_nuet_crit", 0, "All first-year students live on campus. Dana lives on campus. Therefore Dana is a first-year student. What is the best judgment of this argument?", ["Valid, because Dana lives on campus", "Invalid, because people who are not first-years can also live on campus", "Valid, because every campus resident is a first-year", "Invalid, because Dana might live off campus"], 1, "All first-year students live on campus, but other people can live on campus too. Living there does not prove Dana is a first-year."),
    q("test_nuet_crit", 1, "A library will extend evening hours only if more students request it. A survey of 40 students found that 30 wanted later hours. Someone concludes the library should extend evening hours. Which assumption does that conclusion rely on?", ["Those 40 students are enough to represent the student body", "Students never use the library in the evening now", "The library is closed every morning", "Most students prefer to study at home"], 0, "The argument treats 40 students as if they stand for the whole university. That is assumed, not stated."),
    q("test_nuet_crit", 2, "If it rains, the match is cancelled. The match was not cancelled. What follows?", ["It rained", "It did not rain", "The match was played at night", "Nothing follows"], 1, "If rain always cancels the match, then a match that went ahead means it did not rain."),
    q("test_nuet_crit", 3, "Every player who skipped practice failed the fitness test. Amir passed the fitness test. What must be true?", ["Amir skipped practice", "Amir did not skip practice", "Amir is the strongest player", "Nobody passed the fitness test"], 1, "Anyone who skipped practice failed. Amir passed, so he cannot be in the group that skipped."),
    q("test_nuet_full", 0, "Solve 2(x - 3) = 10. What is x?", ["5", "8", "4", "7"], 1, "Divide both sides by 2 to get x - 3 = 5, then add 3."),
    q("test_nuet_full", 1, "A rectangle is 6 by 4. What is the length of its diagonal?", ["10", "the square root of 52", "24", "5"], 1, "The diagonal is the square root of 6 squared plus 4 squared, which is 36 + 16 = 52."),
    q("test_nuet_full", 2, "Some athletes are students. All students are readers. Which statement must be true?", ["All athletes are readers", "Some athletes are readers", "No athletes are readers", "All readers are athletes"], 1, "At least one athlete is a student, and every student is a reader, so at least one athlete is a reader."),
    q("test_nuet_full", 3, "A school says its new workshop raised scores because the class average moved from 70 to 78. Which finding weakens that claim?", ["The national average rose by the same amount that month", "Students said they enjoyed the workshop", "The workshop lasted three hours", "The school has a library"], 0, "If scores rose everywhere, the workshop is not the only explanation."),
    q("test_ielts_reading", 0, "According to the passage, why were the older library measures incomplete?", ["They ignored books published before 2010", "They missed remote use and learning activity", "They counted only digital loans", "They were used by a single branch"], 1, "The first paragraph says door counts miss downloads, online groups, and learning workstations."),
    q("test_ielts_reading", 1, "What happened at the branch near the closed metro station?", ["Visits fell, while digital loans and learning sessions rose", "Every measure fell", "The branch was closed", "It stopped offering workshops"], 0, "Visits fell after the station closed, while digital loans doubled and learning sessions grew by a third."),
    q("test_ielts_reading", 2, "In the last paragraph, the word narrow is closest in meaning to", ["limited", "popular", "expensive", "temporary"], 0, "Here narrow means limited: a finished session does not include every kind of learning."),
    q("test_ielts_reading", 3, "Which statement would the supporters agree with?", ["One number can describe a library completely", "Publishing several measures is better than relying on one", "Footfall should be the only public statistic", "Digital loans should be discontinued"], 1, "Supporters say three numbers stop any one number from standing in for the whole library."),
    q("test_ielts_full", 0, "Although the lecture began late, most students stayed until the end. The word Although signals", ["a contrast", "a cause", "a sequence of equal steps", "a comparison of size"], 0, "Although introduces a contrast between the late start and students staying."),
    q("test_ielts_full", 1, "Which sentence is correct?", ["The results was announced yesterday.", "The results were announced yesterday.", "The results were announce yesterday.", "The results is announced yesterday."], 1, "Results is plural, so the verb is were, and the past participle is announced."),
    q("test_ielts_full", 2, "The experiment was called off because the sample was contaminated. Called off means", ["started", "cancelled", "repeated", "published"], 1, "Called off means cancelled."),
    q("test_ielts_full", 3, "Which sentence is the most formal?", ["We wanna get the data soon.", "The committee requests the data by Friday.", "Give us the data, yeah?", "The data is gonna be late."], 1, "The committee sentence is formal. The others use conversation or slang."),
  ],
  saved: {},
};

function q(
  testId: string,
  position: number,
  prompt: string,
  choices: string[],
  correctIndex: number,
  explanation: string,
) {
  return {
    id: `${testId}_${position}`,
    testId,
    prompt,
    choices,
    correctIndex,
    explanation,
    position,
  };
}
