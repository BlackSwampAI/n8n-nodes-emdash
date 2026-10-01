/**
 * Focused model of action/trigger grouping in n8n 2.30.6 with n8n-editor-ui 2.30.4.
 *
 * Pinned picker source:
 * https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/frontend/editor-ui/src/features/shared/nodeCreator/composables/useActionsGeneration.ts
 * Official paired-node naming references:
 * https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/nodes-base/nodes/Airtable/Airtable.node.ts
 * https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/nodes-base/nodes/Airtable/AirtableTrigger.node.ts
 *
 * This fixture models source behavior and is not a browser acceptance test. It does not reproduce
 * Airtable's polling implementation or import the external nodes-base package.
 */
import type { INodePropertyOptions, INodeTypeDescription } from 'n8n-workflow';

export interface PickerSelection {
	category: 'Actions' | 'Triggers';
	targetNodeName: string;
	nodeValues: Record<string, unknown>;
}

export interface PickerServiceGroup {
	name: string;
	description: string;
	selections: PickerSelection[];
}

export const visibleNodeTypes = (nodeTypes: INodeTypeDescription[]) =>
	nodeTypes.filter((nodeType) => !nodeType.hidden);

const actionSelections = (nodeType: INodeTypeDescription): PickerSelection[] =>
	nodeType.properties
		.filter((property) => property.name === 'operation')
		.flatMap((property) => {
			const resource = property.displayOptions?.show?.resource?.[0];
			return (property.options as INodePropertyOptions[]).map((operation) => ({
				category: 'Actions',
				targetNodeName: nodeType.name,
				nodeValues: { resource, operation: operation.value },
			}));
		});

const triggerSelections = (nodeType: INodeTypeDescription): PickerSelection[] => {
	const eventProperty = nodeType.properties.find(
		(property) => property.displayName.toLowerCase() === 'events',
	);
	return ((eventProperty?.options ?? []) as INodePropertyOptions[])
		.filter((event) => !['*', '', ' '].includes(event.name))
		.map((event) => ({
			category: 'Triggers',
			targetNodeName: nodeType.name,
			nodeValues: { events: [event.value] },
		}));
};

/** Focused equivalent of upstream app creation, trigger-name normalization, and action merging. */
export const generateServiceGroups = (nodeTypes: INodeTypeDescription[]): PickerServiceGroup[] => {
	const visibleNodes = visibleNodeTypes(nodeTypes);
	const groups = new Map<string, PickerServiceGroup>();

	for (const node of visibleNodes.filter((candidate) => !candidate.group.includes('trigger'))) {
		groups.set(node.name, {
			name: node.name,
			description: node.description,
			selections: actionSelections(node),
		});
	}

	for (const trigger of visibleNodes.filter((candidate) => candidate.group.includes('trigger'))) {
		const normalizedName = trigger.name.replace('Trigger', '');
		const app = groups.get(normalizedName);
		const events = triggerSelections(trigger);
		if (app && app.selections.length > 0) {
			app.selections = [...app.selections, ...events];
			app.description = trigger.description;
		} else {
			groups.set(trigger.name, {
				name: trigger.name,
				description: trigger.description,
				selections: events,
			});
		}
	}

	return [...groups.values()];
};
