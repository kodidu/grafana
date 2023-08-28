import { css } from '@emotion/css';
import React, { FormEvent } from 'react';

import { GrafanaTheme2, SelectableValue } from '@grafana/data';
import { ButtonSelect, InlineField, InlineFieldRow, Input, Select, useStyles2 } from '@grafana/ui';
import { EvalFunction } from 'app/features/alerting/state/alertDef';

import { ClassicCondition, ExpressionQuery, thresholdFunctions } from '../types';

interface Props {
  labelWidth: number | 'auto';
  refIds: Array<SelectableValue<string>>;
  query: ExpressionQuery;
  onChange: (query: ExpressionQuery) => void;
}

const defaultThresholdFunction = EvalFunction.IsAbove;

export const Hysteresis = ({ labelWidth, onChange, refIds, query }: Props) => {
  const styles = useStyles2(getStyles);

  const defaultEvaluator: ClassicCondition = {
    type: 'query',
    evaluator: {
      type: defaultThresholdFunction,
      params: [0, 0],
    },
    query: {
      params: [],
    },
    reducer: {
      params: [],
      type: 'last',
    },
  };

  const loadCondition = query.loadCondition?? defaultEvaluator;
  const unloadCondition = query.unloadCondition?? defaultEvaluator;

  const loadThresholdFunction = thresholdFunctions.find((fn) => fn.value === loadCondition.evaluator?.type);
  const unloadThresholdFunction = thresholdFunctions.find((fn) => fn.value === unloadCondition.evaluator?.type);

  const onRefIdChange = (value: SelectableValue<string>) => {
    onChange({ ...query, expression: value.value });
  };

  const onLoadEvalFunctionChange = (value: SelectableValue<EvalFunction>) => {
    const type = value.value ?? defaultThresholdFunction;

    onChange({
      ...query,
      loadCondition: updateCondition(loadCondition, { type }),
    });
  };

  const onUnloadEvalFunctionChange = (value: SelectableValue<EvalFunction>) => {
    const type = value.value ?? defaultThresholdFunction;

    onChange({
      ...query,
      unloadCondition: updateCondition(unloadCondition, { type }),
    });
  };

  const onLoadEvaluateValueChange = (event: FormEvent<HTMLInputElement>, index: number) => {
    const newValue = parseFloat(event.currentTarget.value);
    const newParams = [...loadCondition.evaluator.params];
    newParams[index] = newValue;

    onChange({
      ...query,
      loadCondition: updateCondition(loadCondition, { params: newParams }),
    });
  };

  const onUnloadEvaluateValueChange = (event: FormEvent<HTMLInputElement>, index: number) => {
    const newValue = parseFloat(event.currentTarget.value);
    const newParams = [...unloadCondition.evaluator.params];
    newParams[index] = newValue;

    onChange({
      ...query,
      unloadCondition: updateCondition(unloadCondition, { params: newParams }),
    });
  };

  const isRange = (condition: ClassicCondition): boolean => condition.evaluator.type === EvalFunction.IsWithinRange || condition.evaluator.type === EvalFunction.IsOutsideRange;

  return (
    <>
      <InlineFieldRow>
        <InlineField label="Input" labelWidth={labelWidth}>
          <Select onChange={onRefIdChange} options={refIds} value={query.expression} width={20} />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label={"Load Condition"}>
          <ButtonSelect
            className={styles.buttonSelectText}
            options={thresholdFunctions}
            onChange={onLoadEvalFunctionChange}
            value={loadThresholdFunction}
          />
        </InlineField>

        {isRange(loadCondition) ? (
          <>
            <Input
              type="number"
              width={10}
              onChange={(event) => onLoadEvaluateValueChange(event, 0)}
              defaultValue={loadCondition.evaluator.params[0]}
            />
            <div className={styles.button}>TO</div>
            <Input
              type="number"
              width={10}
              onChange={(event) => onLoadEvaluateValueChange(event, 1)}
              defaultValue={loadCondition.evaluator.params[1]}
            />
          </>
        ) : (
          <Input
            type="number"
            width={10}
            onChange={(event) => onLoadEvaluateValueChange(event, 0)}
            defaultValue={loadCondition.evaluator.params[0] || 0}
          />
        )}
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label={"Unload Condition"}>
        <ButtonSelect
            className={styles.buttonSelectText}
            options={thresholdFunctions}
            onChange={onUnloadEvalFunctionChange}
            value={unloadThresholdFunction}
        />
        </InlineField>
        {isRange(unloadCondition) ? (
            <>
              <Input
                  type="number"
                  width={10}
                  onChange={(event) => onUnloadEvaluateValueChange(event, 0)}
                  defaultValue={unloadCondition.evaluator.params[0]}
              />
              <div className={styles.button}>TO</div>
              <Input
                  type="number"
                  width={10}
                  onChange={(event) => onUnloadEvaluateValueChange(event, 1)}
                  defaultValue={unloadCondition.evaluator.params[1]}
              />
            </>
        ) : (
            <Input
                type="number"
                width={10}
                onChange={(event) => onUnloadEvaluateValueChange(event, 0)}
                defaultValue={unloadCondition.evaluator.params[0] || 0}
            />
        )}
      </InlineFieldRow>
    </>
  );
};

function updateCondition(
  conditions: ClassicCondition,
  update: Partial<{
    params: number[];
    type: EvalFunction;
  }>
): ClassicCondition {
  return {
      ...conditions,
      evaluator: {
        ...conditions.evaluator,
        ...update,
      },
    };
}

const getStyles = (theme: GrafanaTheme2) => ({
  buttonSelectText: css`
    color: ${theme.colors.primary.text};
    font-size: ${theme.typography.bodySmall.fontSize};
    text-transform: uppercase;
  `,
  button: css`
    height: 32px;

    color: ${theme.colors.primary.text};
    font-size: ${theme.typography.bodySmall.fontSize};
    text-transform: uppercase;

    display: flex;
    align-items: center;
    border-radius: ${theme.shape.radius.default};
    font-weight: ${theme.typography.fontWeightBold};
    border: 1px solid ${theme.colors.border.medium};
    white-space: nowrap;
    padding: 0 ${theme.spacing(1)};
    background-color: ${theme.colors.background.primary};
  `,
});
