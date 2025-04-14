import { SignleSelectAnswer, SingleSelectAnswerBuilder } from '../formComponents/SingleSelect.jsx';
import { MultiSelectAnswer, MultiSelectAnswerBuilder } from '../formComponents/MultiSelect.jsx';
import { ShortTextAnswer, ShortTextAnswerBuilder } from '../formComponents/ShortText.jsx';
import { TrueFalseAnswer, TrueFalseAnswerBuilder } from '../formComponents/TrueFalse.jsx';
import { LongTextAnswer, LongTextAnswerBuilder } from '../formComponents/LongText.jsx';
import { NumericAnswer, NumericAnswerBuilder } from '../formComponents/Numeric.jsx';
import { ParagraphBlock, ParagraphBlockBuilder } from '../formComponents/Paragraph.jsx';
import { ImageBlock, ImageBlockBuilder } from './ImageBlock.jsx';


const formComponentsBuilders = {
  "short-text-answer": ShortTextAnswerBuilder,
  "long-text-answer": LongTextAnswerBuilder,
  "numeric-answer": NumericAnswerBuilder,
  "truefalse-answer": TrueFalseAnswerBuilder,
  "single-select-answer": SingleSelectAnswerBuilder,
  "multi-select-answer": MultiSelectAnswerBuilder,
  "paragraph": ParagraphBlockBuilder,
  "image": ImageBlockBuilder
}

const answerFormComponentsBuilders = {
  "short-text-answer": ShortTextAnswer,
  "long-text-answer": LongTextAnswer,
  "numeric-answer": NumericAnswer,
  "truefalse-answer": TrueFalseAnswer,
  "single-select-answer": SignleSelectAnswer,
  "multi-select-answer": MultiSelectAnswer,
  "paragraph": ParagraphBlock,
  "image": ImageBlock
}

const staticComponents = ["paragraph", "image"];

export function isComponentRespondable(componentType) {
  return !staticComponents.includes(componentType);
}

export function calcQuestionNoFor(index, formComponents) {
  let questions = 0;

  for (let i = 0; i < formComponents.length; i++) {
    const component = formComponents[i];

    if (i === index) {
      if (isComponentRespondable(component.componentType)) {
        return questions + 1;
      } else {
        return null;
      }
    }

    if (isComponentRespondable(component.componentType)) {
      questions++;
    }
  }
  return null;
}

export function getComponentBuilder(componentId) {
    return formComponentsBuilders[componentId];
}

export function getAnswerComponentBuilder(componentId) {
    return answerFormComponentsBuilders[componentId];
}
