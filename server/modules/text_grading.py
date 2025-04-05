from modules import logs

import threading


class _AITextGrader:
    def __init__(self):
        self.FACT_CHECKER_WEIGHT = 0.6
        self.SIMILARITY_CHECKER_WEIGHT = 0.4
        self.MIN_SIMILARITY_THRESHOLD_FULL = 0.55
        self.MIN_SIMILARITY_THRESHOLD_CHUNK = 0.35
        self.MIN_LEN_RATIO = 0.3
        self.POSITIVE_THRESHOLD = 0.5

        self.__setup_finished = False
        threading.Thread(target=self.__setup__, daemon=True).start()
        
    def __setup__(self) -> None:
        from sentence_transformers import SentenceTransformer, util
        from transformers import pipeline
        
        self.sentence_transformer_util = util
        self.fact_checker_pipeline = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
        self.similarity_sentence_transformer = SentenceTransformer('all-MiniLM-L6-v2')
        self.__setup_finished = True
        logs.info("Forms", "Initialized TextGrader")
        
    def fact_verification_model(self, expectation: str, response: str) -> float:
        result = self.fact_checker_pipeline(response, [expectation], multi_label=False)
        return result['scores'][0] if result['labels'][0] == expectation else 1 - result['scores'][0]
        
    def similarity_verification_model(self, expectation: str, response: str) -> float:
        embeddings = self.similarity_sentence_transformer.encode([expectation, response], convert_to_tensor=True)
        similarity = self.sentence_transformer_util.pytorch_cos_sim(embeddings[0], embeddings[1]).item()
        return round(similarity, 2)
    
    def split_text_into_chunks(self, text: str, n: int) -> list[str]:
        words = text.split()
        part_size = len(words) // n
        remainder = len(words) % n 
    
        parts = []
        start = 0
        
        for i in range(n):
            end = start + part_size + (1 if i < remainder else 0)
            part = words[start:end]
            parts.append(" ".join(part))
            start = end
    
        return parts
    
    def grade_single_chunk(self, expected_window: str, answer: str, max_grade: int, similarity_threshold: float) -> int:
        if not expected_window or not answer:
            return 0
        
        shallow_fact_verification_result = self.fact_verification_model(expected_window, answer)
        languange_similarity_check_result = self.similarity_verification_model(expected_window, answer)
    
        if languange_similarity_check_result < similarity_threshold:
            return 0
        
        weigthed_result = (
            shallow_fact_verification_result * self.FACT_CHECKER_WEIGHT + \
            languange_similarity_check_result * self.SIMILARITY_CHECKER_WEIGHT        
        )
        
        if weigthed_result < self.POSITIVE_THRESHOLD:
            return 0
        
        grade = round(((weigthed_result - 0.5) * 2) * max_grade)
        return grade
    
    
    def grade_answer(self, expectation: str, response: str, max_grade: int) -> int:
        if not self.__setup_finished:
            return None
        
        # Answer is not long enough to contain expected answer.
        if not response or len(response) / (len(expectation) or 1) < self.MIN_LEN_RATIO:
            return 0
    
        expectation_words = len(expectation.split(" "))
        answer_words = len(response.split(" "))
    
        # Response is shorter than expected but it might contain most important parts, so don't judge it according
        # to entire expected answer but to the smaller chunks of expected answer and return average coverage.
        # Use smaller similarity threshold as we might compare to the part that is not present in the answer.
        size_ratio = round(expectation_words / answer_words)
        if expectation_words > 6 and size_ratio > 1:
            chunks_grades = []
            for chunk in self.split_text_into_chunks(expectation, size_ratio):
                chunk_grade = self.grade_single_chunk(chunk, response, max_grade, self.MIN_SIMILARITY_THRESHOLD_CHUNK)
                chunks_grades.append(chunk_grade)
                
            return round(sum(chunks_grades) / len(chunks_grades))
        
        return self.grade_single_chunk(expectation, response, max_grade, self.MIN_SIMILARITY_THRESHOLD_FULL)


TextGrader = _AITextGrader()
