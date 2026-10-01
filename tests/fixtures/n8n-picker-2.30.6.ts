/**
 * Focused model of the node-picker behavior shipped by n8n 2.30.6 with
 * n8n-editor-ui 2.30.4. The expressions are copied from the installed editor source maps:
 * `useActionsGeneration.ts`, `NodeItem.vue`, and `nodeTypes.store.ts`.
 *
 * Official pinned sources:
 * https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/frontend/editor-ui/src/features/shared/nodeCreator/composables/useActionsGeneration.ts
 * https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/frontend/editor-ui/src/features/shared/nodeCreator/components/ItemTypes/NodeItem.vue
 * The installed and official-tag copies byte-match (SHA-256 respectively
 * 18ffdc287067f63298070ba1d2558c5ae6afeab3f77e57f191ada9accd035d83 and
 * 55de3c7c7719ce7f4c4e164aa57c6d0071bdc8ec1e57b1beac52c2e751dd7eb9).
 *
 * This fixture is source-level contract evidence. It is not a browser acceptance test.
 */
import type { INodePropertyOptions, INodeTypeDescription } from 'n8n-workflow';

export const visibleNodeTypes = (nodeTypes: INodeTypeDescription[]) =>
	nodeTypes.filter((nodeType) => !nodeType.hidden);

export const normalizedTriggerName = (trigger: INodeTypeDescription) =>
	trigger.name.replace('Trigger', '');

export const pickerNodeLabel = (nodeType: INodeTypeDescription, actionCount: number) => {
	const hasActions = actionCount > 1;
	const trimmedDisplayName = nodeType.displayName.trimEnd();
	return (hasActions ? trimmedDisplayName.replace('Trigger', '') : trimmedDisplayName).trimEnd();
};

export const eventActionValues = (nodeType: INodeTypeDescription) => {
	const matchingKeys = ['event', 'events', 'trigger on'];
	const matchedProperty = nodeType.properties.find((property) =>
		matchingKeys.includes(property.displayName?.toLowerCase()),
	);
	if (!matchedProperty?.options) return [];
	return (matchedProperty.options as INodePropertyOptions[])
		.filter((option) => !['*', '', ' '].includes(option.name))
		.map((option) => option.value);
};

export interface PickerSelection {
	targetNodeName: string;
	values: Record<string, unknown>;
}

export interface PickerEntry {
	name: string;
	description: string;
	selections: PickerSelection[];
}

const actionSelections = (nodeType: INodeTypeDescription): PickerSelection[] =>
	nodeType.properties
		.filter((property) => property.name === 'operation')
		.flatMap((property) =>
			(property.options as INodePropertyOptions[]).map((option) => ({
				targetNodeName: nodeType.name,
				values: { operation: option.value },
			})),
		);

const triggerSelections = (nodeType: INodeTypeDescription): PickerSelection[] =>
	eventActionValues(nodeType).map((event) => ({
		targetNodeName: nodeType.name,
		values: { events: [event] },
	}));

/** Focused equivalent of upstream visibility, action generation, and trigger merge ordering. */
export const generatePickerEntries = (nodeTypes: INodeTypeDescription[]): PickerEntry[] => {
	const entries = new Map<string, PickerEntry>();
	const nodes = visibleNodeTypes(nodeTypes);

	for (const node of nodes.filter((candidate) => !candidate.group.includes('trigger'))) {
		entries.set(node.name, {
			name: node.name,
			description: node.description,
			selections: actionSelections(node),
		});
	}

	for (const trigger of nodes.filter((candidate) => candidate.group.includes('trigger'))) {
		const normalizedName = normalizedTriggerName(trigger);
		const app = entries.get(normalizedName);
		const events = triggerSelections(trigger);
		if (app && app.selections.length > 0) {
			app.selections = [...app.selections, ...events];
			app.description = trigger.description;
		} else {
			entries.set(trigger.name, {
				name: trigger.name,
				description: trigger.description,
				selections: events,
			});
		}
	}

	return [...entries.values()];
};
