import { SignleSelectAnswer, SingleSelectAnswerBuilder } from '../formComponents/SingleSelect.jsx';
import { MultiSelectAnswer, MultiSelectAnswerBuilder } from '../formComponents/MultiSelect.jsx';
import { ShortTextAnswer, ShortTextAnswerBuilder } from '../formComponents/ShortText.jsx';
import { TrueFalseAnswer, TrueFalseAnswerBuilder } from '../formComponents/TrueFalse.jsx';
import { LongTextAnswer, LongTextAnswerBuilder } from '../formComponents/LongText.jsx';
import { NumericAnswer, NumericAnswerBuilder } from '../formComponents/Numeric.jsx';


const formComponentsBuilders = {
  "short-text-answer": ShortTextAnswerBuilder,
  "long-text-answer": LongTextAnswerBuilder,
  "numeric-answer": NumericAnswerBuilder,
  "truefalse-answer": TrueFalseAnswerBuilder,
  "single-select-answer": SingleSelectAnswerBuilder,
  "multi-select-answer": MultiSelectAnswerBuilder,
}

const answerFormComponentsBuilders = {
  "short-text-answer": ShortTextAnswer,
  "long-text-answer": LongTextAnswer,
  "numeric-answer": NumericAnswer,
  "truefalse-answer": TrueFalseAnswer,
  "single-select-answer": SignleSelectAnswer,
  "multi-select-answer": MultiSelectAnswer,
}


export function getComponentBuilder(componentId) {
    return formComponentsBuilders[componentId];
}

export function getAnswerComponentBuilder(componentId) {
    return answerFormComponentsBuilders[componentId];
}
