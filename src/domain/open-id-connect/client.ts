/**
 * Many types and interfaces defined within this module are referenced directly from the
 * OpenID Connect 1.0 specification and the OAuth 2.0 Authorization Framework.
 *
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest}
 * @see {@link https://tools.ietf.org/html/rfc6749}
 */

import { SessionState } from '../sessions/session-state';
import { EnumConstType } from './types';

export interface OpenIDConnectClient {
	getAuthorizationUrl(options: Partial<AuthorizationUrlOptions>): string;
	exchangeCode(options: ExchangeCodeOptions): Promise<SessionState>;
	refresh(options: RefreshOptions): Promise<SessionState>;
}

export interface AuthorizationUrlOptions extends Record<string, any> {
	/**
	 * REQUIRED. OpenID Connect requests MUST contain the openid scope value. If
	 * the openid scope value is not present, the behavior is entirely
	 * unspecified. Other scope values MAY be present. Scope values used that are
	 * not understood by an implementation SHOULD be ignored. See Sections 5.4 and
	 * 11 for additional scope values defined by this specification.
	 */
	scope: string | string[] | Array<OIDCScopeType | string>;
	/**
	 * REQUIRED. OAuth 2.0 Response Type value that determines the authorization
	 * processing flow to be used, including what parameters are returned from the
	 * endpoints used. When using the Authorization Code Flow, this value is code.
	 */
	response_type: ResponseTypeType;
	/**
	 * REQUIRED. OAuth 2.0 Client Identifier valid at the Authorization Server.
	 */
	client_id: string;
	/**
	 * REQUIRED. Redirection URI to which the response will be sent. This URI MUST
	 * exactly match one of the Redirection URI values for the Client
	 * pre-registered at the OpenID Provider, with the matching performed as
	 * described in Section 6.2.1 of [RFC3986] (Simple String Comparison). When
	 * using this flow, the Redirection URI SHOULD use the https scheme; however,
	 * it MAY use the http scheme, provided that the Client Type is confidential,
	 * as defined in Section 2.1 of OAuth 2.0, and provided the OP allows the use
	 * of http Redirection URIs in this case. Also, if the Client is a native
	 * application, it MAY use the http scheme with localhost or the IP loopback
	 * literals 127.0.0.1 or [::1] as the hostname. The Redirection URI MAY use an
	 * alternate scheme, such as one that is intended to identify a callback into
	 * a native application.
	 */
	redirect_uri: string;
	/**
	 * RECOMMENDED. Opaque value used to maintain state between the request and
	 * the callback. Typically, Cross-Site Request Forgery (CSRF, XSRF) mitigation
	 * is done by cryptographically binding the value of this parameter with a
	 * browser cookie.
	 */
	state: string;

	// PKCE
	code_challenge?: string;
	code_challenge_method?: 'S256';

	/**
	 * OPTIONAL. String value used to associate a Client session with an ID Token,
	 * and to mitigate replay attacks. The value is passed through unmodified from
	 * the Authentication Request to the ID Token. Sufficient entropy MUST be present
	 * in the nonce values used to prevent attackers from guessing values. For
	 * implementation notes, see Section 15.5.2.
	 */
	nonce?: string;
	/**
	 * OPTIONAL. ASCII string value that specifies how the Authorization Server displays
	 * the authentication and consent user interface pages to the End-User. The defined
	 * values are: The Authorization Server MAY also attempt to detect the capabilities
	 * of the User Agent and present an appropriate display. If an OP receives a display
	 * value outside the set defined above that it does not understand, it MAY return an
	 * error or it MAY ignore it; in practice, not returning errors for not-understood
	 * values will help facilitate phasing in extensions using new display values.
	 */
	display?: string;
	/**
	 * OPTIONAL. Space-delimited, case-sensitive list of ASCII string values that
	 * specifies whether the Authorization Server prompts the End-User for
	 * reauthentication and consent.
	 */
	prompt?: string;

	/**
	 * OPTIONAL. Maximum Authentication Age. Specifies the allowable elapsed time in
	 * seconds since the last time the End-User was actively authenticated by the OP.
	 * If the elapsed time is greater than this value, the OP MUST attempt to actively
	 * re-authenticate the End-User. (The max_age request parameter corresponds to the
	 * OpenID 2.0 PAPE [OpenID.PAPE] max_auth_age request parameter.) When max_age is
	 * used, the ID Token returned MUST include an auth_time Claim Value. Note that
	 * max_age=0 is equivalent to prompt=login.
	 */
	max_age?: string;
	/**
	 * OPTIONAL. End-User's preferred languages and scripts for the user interface,
	 * represented as a space-separated list of BCP47 [RFC5646] language tag values,
	 * ordered by preference. For instance, the value "fr-CA fr en" represents a
	 * preference for French as spoken in Canada, then French (without a region designation),
	 * followed by English (without a region designation). An error SHOULD NOT result if
	 * some or all of the requested locales are not supported by the OpenID Provider.
	 */
	ui_locales?: string;
	/**
	 * OPTIONAL. ID Token previously issued by the Authorization Server being passed as a
	 * hint about the End-User's current or past authenticated session with the Client. If
	 * the End-User identified by the ID Token is already logged in or is logged in as a
	 * result of the request (with the OP possibly evaluating other information beyond the
	 * ID Token in this decision), then the Authorization Server returns a positive
	 * response; otherwise, it MUST return an error, such as login_required. When possible,
	 * an id_token_hint SHOULD be present when prompt=none is used and an invalid_request
	 * error MAY be returned if it is not; however, the server SHOULD respond successfully
	 * when possible, even if it is not present. The Authorization Server need not be
	 * listed as an audience of the ID Token when it is used as an id_token_hint value.
	 *
	 * If the ID Token received by the RP from the OP is encrypted, to use it as an id_token_hint,
	 * the Client MUST decrypt the signed ID Token contained within the encrypted ID Token. The
	 * Client MAY re-encrypt the signed ID token to the Authentication Server using a key that
	 * enables the server to decrypt the ID Token and use the re-encrypted ID token as the
	 * id_token_hint value.
	 */
	id_token_hint?: string;
	/**
	 * OPTIONAL. Hint to the Authorization Server about the login identifier the End-User might
	 * use to log in (if necessary). This hint can be used by an RP if it first asks the End-User
	 * for their e-mail address (or other identifier) and then wants to pass that value as a hint
	 * to the discovered authorization service. It is RECOMMENDED that the hint value match the
	 * value used for discovery. This value MAY also be a phone number in the format specified for
	 * the phone_number Claim. The use of this parameter is left to the OP's discretion.
	 */
	login_hint?: string;
	/**
	 * OPTIONAL. Requested Authentication Context Class Reference values. Space-separated string
	 * that specifies the acr values that the Authorization Server is being requested to use for
	 * processing this Authentication Request, with the values appearing in order of preference.
	 * The Authentication Context Class satisfied by the authentication performed is returned as
	 * the acr Claim Value, as specified in Section 2. The acr Claim is requested as a Voluntary
	 * Claim by this parameter.
	 */
	acr_values?: string;

	/// Observed provider-specific hints, not part of the spec, may not be fulfilled by all providers

	connection?: string;
	organizationId?: string;
	domainHint?: string;
	provider?: string;
	screenHint?: ScreenHintType;
}

export type ResponseTypeType = EnumConstType<typeof ResponseType>;
export const ResponseType = {
	/**
	 * The Authorization Code flow
	 */
	Code: 'code',
	/**
	 * The Client Credentials flow
	 */
	ClientCredentials: 'client_credentials',
} as const;

export type OIDCScopeType = EnumConstType<typeof OIDCScope>;
export const OIDCScope = {
	/**
	 * Requests access to the End-User's OpenID information. The OpenID scope value MUST be used when the OpenID Connect requests are used.
	 */
	OpenId: 'openid',
	/**
	 * This scope value requests access to refreshing the token.
	 */
	Offline: 'offline',
	/**
	 * This scope value requests access to the End-User's default profile Claims, which are: name, family_name, given_name, middle_name, nickname, preferred_username, profile, picture, website, gender, birthdate, zoneinfo, locale, and updated_at.
	 */
	Profile: 'profile',
	/**
	 * This scope value requests access to the email and email_verified Claims.
	 */
	Email: 'email',
	/**
	 * This scope value requests access to the address Claim.
	 */
	Address: 'address',
	/**
	 * This scope value requests access to the phone_number and phone_number_verified Claims.
	 */
	Phone: 'phone',
} as const;

export type DisplayType = EnumConstType<typeof Display>;
export const Display = {
	/**
	 * The Authorization Server SHOULD display the authentication and consent UI consistent with a full User Agent page view. If the display parameter is not specified, this is the default display mode.
	 */
	Page: 'page',
	/**
	 * The Authorization Server SHOULD display the authentication and consent UI consistent with a popup User Agent window. The popup User Agent window should be of an appropriate size for a login-focused dialog and should not obscure the entire window that it is popping up over.
	 */
	Popup: 'popup',
	/**
	 * The Authorization Server SHOULD display the authentication and consent UI consistent with a device that leverages a touch interface.
	 */
	Touch: 'touch',
	/**
	 * The Authorization Server SHOULD display the authentication and consent UI consistent with a "feature phone" type display.
	 */
	Wap: 'wap',
} as const;

export type PromptType = EnumConstType<typeof Prompt>;
export const Prompt = {
	/**
	 * The Authorization Server MUST NOT display any authentication or consent user interface pages. An error is returned if an End-User is not already authenticated or the Client does not have pre-configured consent for the requested Claims or does not fulfill other conditions for processing the request. The error code will typically be login_required, interaction_required, or another code defined in Section 3.1.2.6. This can be used as a method to check for existing authentication and/or consent.
	 */
	None: 'none',
	/**
	 * The Authorization Server SHOULD prompt the End-User for reauthentication. If it cannot reauthenticate the End-User, it MUST return an error, typically login_required.
	 */
	Login: 'login',
	/**
	 * The Authorization Server SHOULD prompt the End-User for consent before returning information to the Client. If it cannot obtain consent, it MUST return an error, typically consent_required.
	 */
	Consent: 'consent',
	/**
	 * The Authorization Server SHOULD prompt the End-User to select a user account. This enables an End-User who has multiple accounts at the Authorization Server to select amongst the multiple accounts that they might have current sessions for. If it cannot obtain an account selection choice made by the End-User, it MUST return an error, typically account_selection_required. The prompt parameter can be used by the Client to make sure that the End-User is still present for the current session or to bring attention to the request. If this parameter contains none with any other value, an error is returned. If an OP receives a prompt value outside the set defined above that it does not understand, it MAY return an error or it MAY ignore it; in practice, not returning errors for not-understood values will help facilitate phasing in extensions using new prompt values.
	 */
	SelectAccount: 'select_account',
} as const;

export type ScreenHintType = EnumConstType<typeof ScreenHint>;
export const ScreenHint = {
	SignUp: 'SignUp',
	SignIn: 'SignIn',
} as const;

export interface SuccessAuthenticationResponseParameters {
	/**
	 * REQUIRED.  The authorization code generated by the
	 * authorization server.  The authorization code MUST expire
	 * shortly after it is issued to mitigate the risk of leaks.  A
	 * maximum authorization code lifetime of 10 minutes is
	 * RECOMMENDED.  The client MUST NOT use the authorization code
	 * more than once.  If an authorization code is used more than
	 * once, the authorization server MUST deny the request and SHOULD
	 * revoke (when possible) all tokens previously issued based on
	 * that authorization code.  The authorization code is bound to
	 * the client identifier and redirection URI.
	 */
	code: string;
	/**
	 * REQUIRED if the "state" parameter was present in the client
	 * authorization request.  The exact value received from the
	 * client.
	 */
	state: string;
}

export interface ErrorAuthenticationResponseParameters {
	/**
	 * REQUIRED. Error code.
	 */
	error: AuthenticationErrorCodeType;
	/**
	 * OPTIONAL. Human-readable ASCII encoded text description of the
	 * error.
	 */
	error_description?: string;
	/**
	 * OPTIONAL. URI of a web page that includes additional information
	 * about the error.
	 */
	error_uri?: string;
	/**
	 * OAuth 2.0 state value. REQUIRED if the Authorization Request included
	 * the state parameter. Set to the value received from the Client.
	 */
	state: string;
}

export type AuthenticationErrorCodeType = EnumConstType<typeof AuthenticationErrorCode>;
export const AuthenticationErrorCode = {
	/**
	 * The request is missing a required parameter, includes an
	 * invalid parameter value, includes a parameter more than
	 * once, or is otherwise malformed.
	 */
	InvalidRequest: 'invalid_request',
	/**
	 * The client is not authorized to request an authorization
	 * code using this method.
	 */
	UnauthorizedClient: 'unauthorized_client',
	/**
	 * The resource owner or authorization server denied the
	 * request.
	 */
	AccessDenied: 'access_denied',
	/**
	 * The authorization server does not support obtaining an
	 * authorization code using this method.
	 */
	UnsupportedResponseType: 'unsupported_response_type',
	/**
	 * The requested scope is invalid, unknown, or malformed.
	 */
	InvalidScope: 'invalid_scope',
	/**
	 * The authorization server encountered an unexpected
	 * condition that prevented it from fulfilling the request.
	 * (This error code is needed because a 500 Internal Server
	 * Error HTTP status code cannot be returned to the client
	 * via an HTTP redirect.)
	 */
	ServerError: 'server_error',
	/**
	 * The authorization server is currently unable to handle
	 * the request due to a temporary overloading or maintenance
	 * of the server.  (This error code is needed because a 503
	 * Service Unavailable HTTP status code cannot be returned
	 * to the client via an HTTP redirect.)
	 */
	TemporarilyUnavailable: 'temporarily_unavailable',
	/**
	 * The Authorization Server requires End-User interaction of some form to
	 * proceed. This error MAY be returned when the prompt parameter value in
	 * the Authentication Request is none, but the Authentication Request
	 * cannot be completed without displaying a user interface for End-User
	 * interaction.
	 */
	InteractionRequired: 'interaction_required',
	/**
	 * The Authorization Server requires End-User authentication. This error
	 * MAY be returned when the prompt parameter value in the Authentication
	 * Request is none, but the Authentication Request cannot be completed
	 * without displaying a user interface for End-User authentication.
	 */
	LoginRequired: 'login_required',
	/**
	 * The End-User is REQUIRED to select a session at the Authorization Server.
	 * The End-User MAY be authenticated at the Authorization Server with
	 * different associated accounts, but the End-User did not select a session.
	 * This error MAY be returned when the prompt parameter value in the
	 * Authentication Request is none, but the Authentication Request cannot be
	 * completed without displaying a user interface to prompt for a session to
	 * use.
	 */
	AccountSelectionRequired: 'account_selection_required',
	/**
	 * The Authorization Server requires End-User consent. This error MAY be
	 * returned when the prompt parameter value in the Authentication Request is
	 * none, but the Authentication Request cannot be completed without displaying
	 * a user interface for End-User consent.
	 */
	ConsentRequired: 'consent_required',
	/**
	 * The request_uri in the Authorization Request returns an error or contains
	 * invalid data.
	 */
	InvalidRequestUri: 'invalid_request_uri',
	/**
	 * The request parameter contains an invalid Request Object.
	 */
	InvalidRequestObject: 'invalid_request_object',
	/**
	 * The OP does not support use of the request parameter defined in Section 6.
	 */
	RequestNotSupported: 'request_not_supported',
	/**
	 * The OP does not support use of the request_uri parameter defined in
	 * Section 6.
	 */
	RequestUriNotSupported: 'request_uri_not_supported',
	/**
	 * The OP does not support use of the registration parameter defined in
	 * Section 7.2.1.
	 */
	RegistrationNotSupported: 'registration_not_supported',
} as const;

export interface ExchangeCodeOptions extends Partial<Record<string, string>> {
	code: string;
	grant_type: GrantType;
	client_id?: string;
}

export type GrantType = EnumConstType<typeof Grant>;
export const Grant = {
	AuthorizationCode: 'authorization_code',
} as const;

export interface ExchangeCodeResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	id_token?: string;
}

export interface ExchangePKCMOptions extends ExchangeCodeOptions {
	code_verifier: string;
}

export interface RefreshOptions extends Partial<Record<string, string>> {
	refresh_token: string;
	client_id?: string;
}

export interface IDTokenClaims {
	/**
	 * Subject - Identifier for the End-User at the Issuer.
	 */
	sub: string;
	/**
	 * End-User's full name in displayable form including all name parts, possibly including titles and suffixes, ordered according to the End-User's locale and preferences.
	 */
	name: string;
	/**
	 * Given name(s) or first name(s) of the End-User. Note that in some cultures, people can have multiple given names; all can be present, with the names being separated by space characters.
	 */
	given_name: string;
	/**
	 * Surname(s) or last name(s) of the End-User. Note that in some cultures, people can have multiple family names or no family name; all can be present, with the names being separated by space characters.
	 */
	family_name: string;
	/**
	 * Middle name(s) of the End-User. Note that in some cultures, people can have multiple middle names; all can be present, with the names being separated by space characters. Also note that in some cultures, middle names are not used.
	 */
	middle_name: string;
	/**
	 * Casual name of the End-User that may or may not be the same as the given_name. For instance, a nickname value of Mike might be returned alongside a given_name value of Michael.
	 */
	nickname: string;
	/**
	 * Shorthand name by which the End-User wishes to be referred to at the RP, such as janedoe or j.doe. This value MAY be any valid JSON string including special characters such as @, /, or whitespace. The RP MUST NOT rely upon this value being unique, as discussed in Section 5.7.
	 */
	preferred_username: string;
	/**
	 * URL of the End-User's profile page. The contents of this Web page SHOULD be about the End-User.
	 */
	profile: string;
	/**
	 * URL of the End-User's profile picture. This URL MUST refer to an image file (for example, a PNG, JPEG, or GIF image file), rather than to a Web page containing an image. Note that this URL SHOULD specifically reference a profile photo of the End-User suitable for displaying when describing the End-User, rather than an arbitrary photo taken by the End-User.
	 */
	picture: string;
	/**
	 * URL of the End-User's Web page or blog. This Web page SHOULD contain information published by the End-User or an organization that the End-User is affiliated with.
	 */
	website: string;
	/**
	 * End-User's preferred e-mail address. Its value MUST conform to the RFC 5322 [RFC5322] addr-spec syntax. The RP MUST NOT rely upon this value being unique, as discussed in Section 5.7.
	 */
	email: string;
	/**
	 * True if the End-User's e-mail address has been verified; otherwise false. When this Claim Value is true, this means that the OP took affirmative steps to ensure that this e-mail address was controlled by the End-User at the time the verification was performed. The means by which an e-mail address is verified is context specific, and dependent upon the trust framework or contractual agreements within which the parties are operating.
	 */
	email_verified: boolean;
	/**
	 * End-User's gender. Values defined by this specification are female and male. Other values MAY be used when neither of the defined values are applicable.
	 */
	gender: string;
	/**
	 * End-User's birthday, represented as an ISO 8601-1 [ISO8601‑1] YYYY-MM-DD format. The year MAY be 0000, indicating that it is omitted. To represent only the year, YYYY format is allowed. Note that depending on the underlying platform's date related function, providing just year can result in varying month and day, so the implementers need to take this factor into account to correctly process the dates.
	 */
	birthdate: string;
	/**
	 * String from IANA Time Zone Database [IANA.time‑zones] representing the End-User's time zone. For example, Europe/Paris or America/Los_Angeles.
	 */
	zoneinfo: string;
	/**
	 * End-User's locale, represented as a BCP47 [RFC5646] language tag. This is typically an ISO 639 Alpha-2 [ISO639] language code in lowercase and an ISO 3166-1 Alpha-2 [ISO3166‑1] country code in uppercase, separated by a dash. For example, en-US or fr-CA. As a compatibility note, some implementations have used an underscore as the separator rather than a dash, for example, en_US; Relying Parties MAY choose to accept this locale syntax as well.
	 */
	locale: string;
	/**
	 * End-User's preferred telephone number. E.164 [E.164] is RECOMMENDED as the format of this Claim, for example, +1 (425) 555-1212 or +56 (2) 687 2400. If the phone number contains an extension, it is RECOMMENDED that the extension be represented using the RFC 3966 [RFC3966] extension syntax, for example, +1 (604) 555-1234;ext=5678.
	 */
	phone_number: string;
	/**
	 * True if the End-User's phone number has been verified; otherwise false. When this Claim Value is true, this means that the OP took affirmative steps to ensure that this phone number was controlled by the End-User at the time the verification was performed. The means by which a phone number is verified is context specific, and dependent upon the trust framework or contractual agreements within which the parties are operating. When true, the phone_number Claim MUST be in E.164 format and any extensions MUST be represented in RFC 3966 format.
	 */
	phone_number_verified: boolean;
	/**
	 End-User's preferred postal address. The value of the address member is a JSON [RFC8259] structure containing some or all of the members defined in Section 5.1.1.
	 */
	address: AddressClaim;
	/**
	 * Time the End-User's information was last updated. Its value is a JSON number representing the number of seconds from 1970-01-01T00:00:00Z as measured in UTC until the date/time.
	 */
	updated_at: number;
}

export interface AddressClaim {
	/**
	 * Full mailing address, formatted for display or use on a mailing label. This field MAY contain multiple lines, separated by newlines. Newlines can be represented either as a carriage return/line feed pair ("\r\n") or as a single line feed character ("\n").
	 */
	formatted: string;
	/**
	 * Full street address component, which MAY include house number, street name, Post Office Box, and multi-line extended street address information. This field MAY contain multiple lines, separated by newlines. Newlines can be represented either as a carriage return/line feed pair ("\r\n") or as a single line feed character ("\n").
	 */
	street_address: string;
	/**
	 * City or locality component.
	 */
	locality: string;
	/**
	 * State, province, prefecture, or region component.
	 */
	region: string;
	/**
	 * Zip code or postal code component.
	 */
	postal_code: string;
	/**
	 * Country name component.
	 */
	country: string;
}
