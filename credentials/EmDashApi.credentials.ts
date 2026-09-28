import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EmDashApi implements ICredentialType {
	name = 'emdashApi';

	displayName = 'EmDash API';

	icon: Icon = { light: 'file:../icons/emdash.svg', dark: 'file:../icons/emdash.dark.svg' };

	documentationUrl = 'https://github.com/emdash-cms/emdash#readme';

	properties: INodeProperties[] = [
		{
			displayName: 'Site URL',
			name: 'siteUrl',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'https://cms.example.com',
			description: 'The public URL of the EmDash site. A trailing slash is optional.',
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Personal Access Token (PAT) with appropriate scopes (e.g. content:read, content:write, schema:read).',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.siteUrl.trim().replace(/\\/+$/, "") + "/_emdash/api"}}',
			url: '/schema/collections',
			method: 'GET',
		},
		rules: [
			{
				type: 'responseCode',
				properties: {
					value: 401,
					message: 'The EmDash Personal Access Token is invalid',
				},
			},
			{
				type: 'responseCode',
				properties: {
					value: 403,
					message: 'The token lacks permission (requires schema:read or admin)',
				},
			},
		],
	};
}
