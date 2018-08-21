'use strict';

import forms from 'newforms';
import {defineMessages} from 'react-intl';

import {AddCardPosition, CardStatus} from '../enums';

//TODO: Internacionalizar as enumeracoes

const messages = defineMessages(
{
    fieldRequired: {id: 'field.required', description: '', defaultMessage: 'Preenchimento obrigatório'},

    fieldGivenNameLabel: {id: 'field.givenname.label', description: '', defaultMessage: 'Nome'},
    fieldGivenNamePlaceHolder: {id: 'field.givenname.placeholder', description: '', defaultMessage: 'Digite seu nome'},
    fieldGivenNameInvalid: {id: 'field.givenname.invalid', description: '', defaultMessage: 'Nome inválido'},

    fieldSurNameLabel: {id: 'field.surname.label', description: '', defaultMessage: 'Sobrenome'},
    fieldSurNamePlaceHolder: {id: 'field.surname.placeholder', description: '', defaultMessage: 'Digite seu sobrenome'},
    fieldSurNameInvalid: {id: 'field.surname.invalid', description: '', defaultMessage: 'Sobrenome inválido'},

    fieldNickNameLabel: {id: 'field.nickname.label', description: '', defaultMessage: 'Apelido'},
    fieldNickNamePlaceHolder: {id: 'field.nickname.placeholder', description: '', defaultMessage: 'Digite seu apelido'},
    fieldNickNameInvalid: {id: 'field.nickname.invalid', description: '', defaultMessage: 'Apelido inválido'},

    fieldEmailLabel: {id: 'field.email.label', description: '', defaultMessage: 'E-mail'},
    fieldEmailPlaceHolder: {id: 'field.email.placeholder', description: '', defaultMessage: 'Digite seu e-mail'},
    fieldEmailInvalid: {id: 'field.email.invalid', description: '', defaultMessage: 'Endereço de e-mail inválido'},

    fieldLoginLabel: {id: 'field.login.label', description: '', defaultMessage: 'Login'},
    fieldLoginPlaceHolder: {id: 'field.login.placeholder', description: '', defaultMessage: 'Digite seu userId (caso ldap) ou e-mail (caso padrão)'},
    fieldLoginInvalid: {id: 'field.login.invalid', description: '', defaultMessage: 'Login inválido'},

    fieldAvatarLabel: {id: 'field.avatar.label', description: '', defaultMessage: 'Avatar'},
    fieldAvatarPlaceHolder: {id: 'field.avatar.placeholder', description: '', defaultMessage: 'Selecione um avatar'},
    fieldAvatarInvalid: {id: 'field.avatar.invalid', description: '', defaultMessage: 'Avatar inválido'},

    fieldPasswordLabel: {id: 'field.password.label', description: '', defaultMessage: 'Senha'},
    fieldPasswordPlaceHolder: {id: 'field.password.placeholder', description: '', defaultMessage: 'Digite sua senha'},

    fieldConfirmPasswordLabel: {id: 'field.confirmPassword.label', description: '', defaultMessage: 'Confirmação de senha'},
    fieldConfirmPasswordPlaceHolder: {id: 'field.confirmPassword.placeholder', description: '', defaultMessage: 'Repita sua senha'},


    fieldOldPasswordLabel: {id: 'field.oldPassword.label', description: '', defaultMessage: 'Senha atual'},
    fieldOldPasswordPlaceHolder: {id: 'field.oldPassword.placeholder', description: '', defaultMessage: 'Digite sua senha atual, caso deseje alterar sua senha'},

    fieldNewPasswordLabel: {id: 'field.newPassword.label', description: '', defaultMessage: 'Nova senha'},
    fieldNewPasswordPlaceHolder: {id: 'field.newPassword.placeholder', description: '', defaultMessage: 'Digite sua nova senha, caso deseje alterar sua senha'},

    fieldConfirmNewPasswordLabel: {id: 'field.confirmNewPassword.label', description: '', defaultMessage: 'Confirmação de nova senha'},
    fieldConfirmNewPasswordPlaceHolder: {id: 'field.confirmNewPassword.placeholder', description: '', defaultMessage: 'Repita sua nova senha'},


    fieldTitleLabel: {id: 'field.title.label', description: '', defaultMessage: 'Título'},
    fieldTitlePlaceHolder: {id: 'field.title.placeholder', description: '', defaultMessage: 'Digite um título'},
    fieldTitleInvalid: {id: 'field.title.invalid', description: '', defaultMessage: 'Título inválido'},

    fieldFeedBackTitleLabel: {id: 'field.feedBackTitle.label', description: '', defaultMessage: 'Deixe aqui seu comentário'},
    fieldFeedBackTitlePlaceHolder: {id: 'field.feedBackTitle.placeholder', description: '', defaultMessage: 'Deixe aqui suas sugestões, reclamações e claro, os bugs, afinal eles existem!! :)'},
    fieldFeedBackTitleInvalid: {id: 'field.feedBackTitle.invalid', description: '', defaultMessage: 'Conteúdo inválido'},

    fieldCardStatusLabel: {id: 'field.cardStatus.label', description: '', defaultMessage: 'Local'},
    fieldCardStatusInvalid: {id: 'field.cardStatus.invalid', description: '', defaultMessage: 'Local inválido'},


    fieldSubtitleLabel: {id: 'field.subtitle.label', description: '', defaultMessage: 'Subtítulo'},
    fieldSubtitlePlaceHolder: {id: 'field.subtitle.placeholder', description: '', defaultMessage: 'Digite um subtítulo'},
    fieldSubtitleInvalid: {id: 'field.subtitle.invalid', description: '', defaultMessage: 'Subtítulo inválido'},

    fieldDescriptionLabel: {id: 'field.description.label', description: '', defaultMessage: 'Descrição'},
    fieldDescriptionPlaceHolder: {id: 'field.description.placeholder', description: '', defaultMessage: 'Digite uma descrição'},
    fieldDescriptionInvalid: {id: 'field.description.invalid', description: '', defaultMessage: 'Descrição inválida'},

    fieldPolicyLabel: {id: 'field.policy.label', description: '', defaultMessage: 'Política de uso'},
    fieldPolicyPlaceHolder: {id: 'field.policy.placeholder', description: '', defaultMessage: 'Defina a política de uso para este item'},
    fieldPolicyInvalid: {id: 'field.policy.invalid', description: '', defaultMessage: 'Política de uso inválida'},

    fieldMaxRatingLabel: {id: 'field.maxrating.label', description: '', defaultMessage: 'Valor Máx.'},
    fieldMaxRatingPlaceHolder: {id: 'field.maxrating.placeholder', description: '', defaultMessage: 'Máx. de Votos'},
    fieldMaxRatingInvalid: {id: 'field.maxrating.invalid', description: '', defaultMessage: 'Valor inválido'},


    fieldLaneTypeLabel: {id: 'field.lanetype.label', description: '', defaultMessage: 'Tipo de Raia'},
    fieldLaneTypeInvalid: {id: 'field.lanetype.invalid', description: '', defaultMessage: 'Tipo de raia inválido'},

    fieldRatingTypeLabel: {id: 'field.ratingtype.label', description: '', defaultMessage: 'Classificação'},
    fieldRatingTypeInvalid: {id: 'field.ratingtype.invalid', description: '', defaultMessage: 'Classificação inválido'},

    fieldFieldTypeLabel: {id: 'field.fieldType.label', description: '', defaultMessage: 'Tipo'},
    fieldFieldTypeInvalid: {id: 'field.fieldType.invalid', description: '', defaultMessage: 'Fase inválida'},

    fieldShowInCardLabel: {id: 'field.showInCard.label', description: '', defaultMessage: 'Exibir'},
    fieldShowInCardInvalid: {id: 'field.showInCard.invalid', description: '', defaultMessage: 'Exibição inválida'},

    fieldFieldHelpTextLabel: {id: 'field.fieldHelpText.label', description: '', defaultMessage: 'Texto de AJuda'},
    fieldFieldHelpTextPlaceHolder: {id: 'field.fieldHelpText.placeholder', description: '', defaultMessage: "Digite um texto de ajuda. Caso selecione o tipo DropDown, cadastre os valores separadors por quebra de linha (<ENTER>). Sendo que os valores podem ser textos, como por exemplo: media, alta, baixa, ou podem estar no formato valor=label, como por exemplo: 1=alta, 2=media, 3=baixa."}, //eslint-disable-line
    fieldFieldHelpTextInvalid: {id: 'field.fieldHelpText.invalid', description: '', defaultMessage: 'Texto de ajuda inválido'},

    fieldProjectPhaseLabel: {id: 'field.projectPhase.label', description: '', defaultMessage: 'Fase do projeto'},
    fieldProjectPhaseInvalid: {id: 'field.projectPhase.invalid', description: '', defaultMessage: 'Fase inválida'},

    fieldLoginStrategyLabel: {id: 'field.loginStrategy.label', description: '', defaultMessage: 'Forma de autenticação'},

    fieldPrefixLabel: {id: 'field.prefix.label', description: '', defaultMessage: 'Prefixo do identificador'},
    fieldPrefixPlaceHolder: {id: 'field.prefix.placeholder', description: '', defaultMessage: 'Prefixo do identificador'},
    fieldPrefixInvalid: {id: 'field.prefix.invalid', description: '', defaultMessage: 'Prefixo inválido'},

    fieldUrlTemplateLabel: {id: 'field.urlTemplate.label', description: '', defaultMessage: 'Template de Url'},
    fieldUrlTemplatePlaceHolder: {id: 'field.urlTemplate.placeholder', description: '', defaultMessage: 'Template de URL. Utilize [PREFIX] e [ID] para montar a url. Ex: http://sistema/items?id=[PREFIX]_[ID]'},
    fieldUrlTemplateInvalid: {id: 'field.urlTemplate.invalid', description: '', defaultMessage: 'Template de url inválido'},

    fieldQueryUrlLabel: {id: 'field.queryUrl.label', description: '', defaultMessage: 'Url de consulta'},
    fieldQueryUrlPlaceHolder: {id: 'field.queryUrl.placeholder', description: '', defaultMessage: 'Url para a query que lista todos os cartões a serem exibidos no quadro'},
    fieldQueryUrlInvalid: {id: 'field.queryUrl.invalid', description: '', defaultMessage: 'URL inválida'},

    fieldPaddingSizeLabel: {id: 'field.paddingSize.label', description: '', defaultMessage: 'Quantidade'},
    fieldPaddingSizePlaceHolder: {id: 'field.paddingSize.placeholder', description: '', defaultMessage: 'Qntd. de caracteres do ID'},
    fieldPaddingSizeInvalid: {id: 'field.paddingSize.invalid', description: '', defaultMessage: 'Quantidade inválida'},

    fieldPaddingCharLabel: {id: 'field.paddingChar.label', description: '', defaultMessage: 'Caracter para complementar identificador'},
    fieldPaddingCharPlaceHolder: {id: 'field.paddingChar.placeholder', description: '', defaultMessage: 'Caracter complementar'},
    fieldPaddingCharInvalid: {id: 'field.paddingChar.invalid', description: '', defaultMessage: 'Caracter inválido'},

    fieldApiHeaderTrackerIntegrationLabel: {id: 'field.ApiHeaderTrackerIntegration.label', description: '', defaultMessage: 'Api Header'},
    fieldApiHeaderTrackerIntegrationPlaceHolder: {id: 'field.ApiHeaderTrackerIntegration.placeholder', description: '', defaultMessage: 'Header da API Key'},
    fieldApiHeaderTrackerIntegrationInvalid: {id: 'field.ApiHeaderTrackerIntegration.invalid', description: '', defaultMessage: 'Header inválido'},

    fieldApiKeyTrackerIntegrationLabel: {id: 'field.ApiKeyTrackerIntegration.label', description: '', defaultMessage: 'API Key'},
    fieldApiKeyTrackerIntegrationPlaceHolder: {id: 'field.ApiKeyTrackerIntegration.placeholder', description: '', defaultMessage: 'API Key para autenticação na ferramenta'},
    fieldApiKeyTrackerIntegrationInvalid: {id: 'field.ApiKeyTrackerIntegration.invalid', description: '', defaultMessage: 'API Key inválida'},

    fieldTypeTrackerIntegrationLabel: {id: 'field.TypeTrackerIntegration.label', description: '', defaultMessage: 'Tipo de Integração'},
    fieldTypeTrackerIntegrationPlaceHolder: {id: 'field.TypeTrackerIntegration.placeholder', description: '', defaultMessage: ''},
    fieldTypeTrackerIntegrationInvalid: {id: 'field.TypeTrackerIntegration.invalid', description: '', defaultMessage: 'Tipo de integração inválido'},

    fieldIsActiveTrackerIntegrationLabel: {id: 'field.IsActiveTrackerIntegration.label', description: '', defaultMessage: 'Ativado'},
    fieldIsActiveTrackerIntegrationPlaceHolder: {id: 'field.IsActiveTrackerIntegration.placeholder', description: '', defaultMessage: ''},

    fieldMemberRoleLabel: {id: 'field.memberRole.label', description: '', defaultMessage: 'Papel'},
    fieldMemberRoleInvalid: {id: 'field.memberRole.invalid', description: '', defaultMessage: 'Papel inválido'},

    fieldHourPerDayLabel: {id: 'field.hourPerDay.label', description: '', defaultMessage: 'Horas p/ dia'},
    fieldHourPerDayPlaceHolder: {id: 'field.hourPerDay.placeholder', description: '', defaultMessage: 'Horas p/ dia'},
    fieldHourPerDayInvalid: {id: 'field.hourPerDay.invalid', description: '', defaultMessage: 'Horas p/ dia inválida'},

    fieldWipLimitLabel: {id: 'field.wipLimit.label', description: '', defaultMessage: 'Limite'},
    fieldWipLimitPlaceHolder: {id: 'field.wipLimit.placeholder', description: '', defaultMessage: 'Limite de Wip (0 = sem Limite)'},
    fieldWipLimitInvalid: {id: 'field.wipLimit.invalid', description: '', defaultMessage: 'Limite inválido'},

    fieldOrderLabel: {id: 'field.order.label', description: '', defaultMessage: 'Ordem'},
    fieldOrderPlaceHolder: {id: 'field.order.placeholder', description: '', defaultMessage: 'Ordem de exibição'},
    fieldOrderInvalid: {id: 'field.order.invalid', description: '', defaultMessage: 'Valor inválido'},

    fieldNumberOfDaysLabel: {id: 'field.numberOfDays.label', description: '', defaultMessage: 'Nº dias'},
    fieldNumberOfDaysPlaceHolder: {id: 'field.numberOfDays.placeholder', description: '', defaultMessage: 'N° dias'},
    fieldNumberOfDaysInvalid: {id: 'field.numberOfDays.invalid', description: '', defaultMessage: 'N° dias inválido. Necessário ser igual ou maior que zero.'},


    fieldBoardTemplateLabel: {id: 'field.boardTemplate.label', description: '', defaultMessage: 'Template'},
    fieldBoardTemplateInvalid: {id: 'field.boardTemplate.invalid', description: '', defaultMessage: 'Layout inválido'},

    fieldIsToReceiveBoardChangeNotificationLabel: {id: 'field.isToReceiveBoardChangeNotification.label', description: '', defaultMessage: 'Assinar notificações de mudanças'},

    fieldIsActiveLabel: {id: 'field.isActiveLabel.label', description: '', defaultMessage: 'Ativado'},


    fieldTitleAddSimpleCardLabel: {id: 'field.addSimpleCard.title.label', description: '', defaultMessage: 'Título'},
    fieldTitleAddSimpleCardPlaceHolder: {id: 'field.addSimpleCard.title.placeholder', description: '', defaultMessage: 'Digite o título do cartão e pressione enter para salvar'},
    fieldTitleAddSimpleCardInvalid: {id: 'field.addSimpleCard.title.invalid', description: '', defaultMessage: 'Título inválido'},

    fieldCardTitleLabel: {id: 'field.card.title.label', description: '', defaultMessage: 'Título'},
    fieldCardTitlePlaceHolder: {id: 'field.card.title.placeholder', description: '', defaultMessage: 'Digite o título do cartão'},
    fieldCardTitleInvalid: {id: 'field.card.title.invalid', description: '', defaultMessage: 'Título inválido'},

    fieldCardMetricValueLabel: {id: 'field.card.metricValue.label', description: '', defaultMessage: 'Métrica'},
    fieldCardMetricValuePlaceHolder: {id: 'field.card.metricValue.placeholder', description: '', defaultMessage: 'Valor'},
    fieldCardMetricValueInvalid: {id: 'field.card.metricValue.invalid', description: '', defaultMessage: 'Valor para métrica inválido'},

    fieldCardPriorityNumberValueLabel: {id: 'field.card.priorityNumber.label', description: '', defaultMessage: 'Prior. Núm.'},
    fieldCardPriorityNumberValuePlaceHolder: {id: 'field.card.priorityNumber.placeholder', description: '', defaultMessage: 'Valor'},
    fieldCardPriorityNumberValueInvalid: {id: 'field.card.priorityNumber.invalid', description: '', defaultMessage: 'Valor da prioridade númerica inválido'},

    fieldCardExternalIdLabel: {id: 'field.card.externalId.label', description: '', defaultMessage: 'ID Externo'},
    fieldCardExternalIdPlaceHolder: {id: 'field.card.externalId.placeholder', description: '', defaultMessage: 'Identificador'},
    fieldCardExternalIdInvalid: {id: 'field.card.externalId.invalid', description: '', defaultMessage: 'Valor para identificador inválido'},

    fieldCardExternalLinkLabel: {id: 'field.card.externalLink.label', description: '', defaultMessage: 'Link Externo'},
    fieldCardExternalLinkPlaceHolder: {id: 'field.card.externalLink.placeholder', description: '', defaultMessage: 'Link'},
    fieldCardExternalLinkInvalid: {id: 'field.card.externalLink.invalid', description: '', defaultMessage: 'Link inválido'},

    fieldCardImpedimentReasonLabel: {id: 'field.card.impedimentReason.label', description: '', defaultMessage: 'Motivo do impedimento'},
    fieldCardImpedimentReasonPlaceHolder: {id: 'field.card.impedimentReason.placeholder', description: '', defaultMessage: 'Motivo'},
    fieldCardImpedimentReasonInvalid: {id: 'field.card.impedimentReason.invalid', description: '', defaultMessage: 'Formato inválido para o motivo'},

    fieldCardStartPlanningDateLabel: {id: 'field.card.startPlanningDate.label', description: '', defaultMessage: 'Início Planejado'},
    fieldCardStartPlanningDateInvalid: {id: 'field.card.startPlanningDate.invalid', description: '', defaultMessage: 'Data inválida'},

    fieldCardEndPlanningDateLabel: {id: 'field.card.endPlanningDate.label', description: '', defaultMessage: 'Término Planejado'},
    fieldCardEndPlanningDateInvalid: {id: 'field.card.endPlanningDate.invalid', description: '', defaultMessage: 'Data inválida'},

    fieldCardStartExecutionDateLabel: {id: 'field.card.startExecutionDate.label', description: '', defaultMessage: 'Início Real'},
    fieldCardStartExecutionDateInvalid: {id: 'field.card.startExecutionDate.invalid', description: '', defaultMessage: 'Data inválida'},

    fieldCardEndExecutionDateLabel: {id: 'field.card.endExecutionDate.label', description: '', defaultMessage: 'Término Real'},
    fieldCardEndExecutionDateInvalid: {id: 'field.card.endExecutionDate.invalid', description: '', defaultMessage: 'Data inválida'},

    fieldBoardVisibilityLabel: {id: 'field.boardVisibility.label', description: '', defaultMessage: 'Visibilidade do quadro'}

});

export default class FormDefinitions
{
    static CustomField_ShortString_MaxLength = 100;
    static CustomField_Text_MaxLength = 10000;

    constructor (intl)
    {
        this.formFields =
        {
            givenname: {label: intl.formatMessage(messages.fieldGivenNameLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldGivenNamePlaceHolder)}, initial: '', required: true, maxLength: 40, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldGivenNameInvalid)}},
            surname: {label: intl.formatMessage(messages.fieldSurNameLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldSurNamePlaceHolder)}, initial: '', required: true, maxLength: 40, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldSurNameInvalid)}},
            nickname: {label: intl.formatMessage(messages.fieldNickNameLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldNickNamePlaceHolder)}, initial: '', maxLength: 10, required: true, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldNickNameInvalid)}},
            email: {label: intl.formatMessage(messages.fieldEmailLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldEmailPlaceHolder)}, initial: '', required: true, maxLength: 100, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldEmailInvalid)}},
            login: {label: intl.formatMessage(messages.fieldLoginLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldLoginPlaceHolder)}, initial: '', required: true, maxLength: 100, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldLoginInvalid)}},
            avatar: {label: intl.formatMessage(messages.fieldAvatarLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldAvatarPlaceHolder)}, initial: '', required: false, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldAvatarInvalid)}},
            password: {label: intl.formatMessage(messages.fieldPasswordLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldPasswordPlaceHolder)}, widget: forms.PasswordInput(), maxLength: 100, initial: '', required: true, errorMessages: {required: intl.formatMessage(messages.fieldRequired)}},
            passwordConfirm: {label: intl.formatMessage(messages.fieldConfirmPasswordLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldConfirmPasswordPlaceHolder)}, widget: forms.PasswordInput(), initial: '', required: true, maxLength: 100, errorMessages: {required: intl.formatMessage(messages.fieldRequired)}},

            oldPassword: {label: intl.formatMessage(messages.fieldOldPasswordLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldOldPasswordPlaceHolder)}, widget: forms.PasswordInput(), maxLength: 100, initial: '', required: false},
            newPassword: {label: intl.formatMessage(messages.fieldNewPasswordLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldNewPasswordPlaceHolder)}, widget: forms.PasswordInput(), maxLength: 100, initial: '', required: false},
            newPasswordConfirm: {label: intl.formatMessage(messages.fieldConfirmNewPasswordLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldConfirmNewPasswordPlaceHolder)}, widget: forms.PasswordInput(), initial: '', required: false, maxLength: 100},

            title: {label: intl.formatMessage(messages.fieldTitleLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldTitlePlaceHolder)}, initial: '', required: true, maxLength: 50, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldTitleInvalid)}},
            subtitle: {label: intl.formatMessage(messages.fieldSubtitleLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldSubtitlePlaceHolder)}, initial: '', required: false, maxLength: 50, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldSubtitleInvalid)}},
            description: {label: intl.formatMessage(messages.fieldDescriptionLabel), widget: forms.Textarea({attrs: {rows: 4, cols: null, maxLength: 1000}}), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldDescriptionPlaceHolder)}, initial: '', required: false, maxLength: 1000, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldDescriptionInvalid)}},
            policy: {label: intl.formatMessage(messages.fieldPolicyLabel), widget: forms.Textarea({attrs: {rows: 4, cols: null, maxLength: 1000}}), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldPolicyPlaceHolder)}, initial: '', required: false, maxLength: 1000, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldPolicyInvalid)}},

            fieldHelpText: {label: intl.formatMessage(messages.fieldFieldHelpTextLabel), widget: forms.Textarea({attrs: {rows: 4, cols: null, maxLength: 10000}}), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldFieldHelpTextPlaceHolder)}, initial: '', required: false, maxLength: 10000, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldFieldHelpTextInvalid)}},

            feedbackTitle: {label: intl.formatMessage(messages.fieldFeedBackTitleLabel), widget: forms.Textarea({attrs: {id: 'addFeedBackTitleTextArea', rows: 5, cols: 40, maxLength: 5000}}), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldFeedBackTitlePlaceHolder)}, initial: '', required: true, maxLength: 5000, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldFeedBackTitleInvalid)}},

            maxRating: {label: intl.formatMessage(messages.fieldMaxRatingLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldMaxRatingPlaceHolder)}, initial: '', required: true, maxLength: 2, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldMaxRatingInvalid)}},

            urlTemplate: {label: intl.formatMessage(messages.fieldUrlTemplateLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldUrlTemplatePlaceHolder)}, initial: '', required: false, maxLength: 255, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldUrlTemplateInvalid)}},
            prefix: {label: intl.formatMessage(messages.fieldPrefixLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldPrefixPlaceHolder)}, initial: '', required: false, maxLength: 10, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldPrefixInvalid)}},
            paddingChar: {label: intl.formatMessage(messages.fieldPaddingCharLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldPaddingCharPlaceHolder)}, initial: '', required: false, maxLength: 1, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldPaddingCharInvalid)}},
            paddingSize: {minValue: 0, maxValue: 50, label: intl.formatMessage(messages.fieldPaddingSizeLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldPaddingSizePlaceHolder)}, initial: '', required: false, maxLength: 3, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldPaddingSizeInvalid)}},

            queryUrl: {label: intl.formatMessage(messages.fieldQueryUrlLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldQueryUrlPlaceHolder)}, initial: '', required: true, maxLength: 255, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldQueryUrlInvalid)}},
            trackerIntegrationType: {
                label: intl.formatMessage(messages.fieldTypeTrackerIntegrationLabel),
                choices: [['', 'Selecione Tipo de Integração'], ['generic', 'Genérico'], ['clearquest', 'ClearQuest']],
                widget: forms.Select({}),
                initial: '',
                required: true,
                errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldTypeTrackerIntegrationInvalid)}
            },
            trackerIntegrationApiHeader: {label: intl.formatMessage(messages.fieldApiHeaderTrackerIntegrationLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldApiHeaderTrackerIntegrationPlaceHolder)}, maxLength: 255, initial: '', required: false, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldApiHeaderTrackerIntegrationInvalid)}},
            trackerIntegrationApiKey: {label: intl.formatMessage(messages.fieldApiKeyTrackerIntegrationLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldApiKeyTrackerIntegrationPlaceHolder)}, initial: '', required: false, widget: forms.PasswordInput(), maxLength: 255, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldApiKeyTrackerIntegrationInvalid)}},
            isActive: {label: intl.formatMessage(messages.fieldIsActiveLabel), required: false},

            hourPerDay: {label: intl.formatMessage(messages.fieldHourPerDayLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldHourPerDayPlaceHolder)}, initial: '', required: true, maxLength: 3, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldHourPerDayInvalid)}},
            wipLimit: {minValue: 0, label: intl.formatMessage(messages.fieldWipLimitLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldWipLimitPlaceHolder)}, initial: '', required: false, maxLength: 3, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldWipLimitInvalid)}},
            numberOfDays: {minValue: 0, label: intl.formatMessage(messages.fieldNumberOfDaysLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldNumberOfDaysPlaceHolder)}, initial: '', required: true, maxLength: 4, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldNumberOfDaysInvalid)}},

            order: {minValue: 0, label: intl.formatMessage(messages.fieldOrderLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldOrderPlaceHolder)}, initial: '', required: true, maxLength: 3, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldOrderInvalid)}},

            isToReceiveBoardChangeNotification: {label: intl.formatMessage(messages.fieldIsToReceiveBoardChangeNotificationLabel), required: false},

            //TODO: colocar todos os campos em enumeracao
            boardVisibility: {
                label: intl.formatMessage(messages.fieldBoardVisibilityLabel),
                choices: [['internal', 'Interno'], ['public', 'Público - Somente visualização'], ['publicWrite', 'Público - Todos podem contribuir']],
                widget: forms.Select({}),
                initial: ''
            },

            boardTemplate: {
                label: intl.formatMessage(messages.fieldBoardTemplateLabel),
                choices: [['', 'Selecione um template'], ['empty', 'Em branco'], ['software', 'Desenvolvimento de Software'], ['portfolio', 'Portfolio'], ['cycle', 'Planejamento de Ciclo']],
                widget: forms.Select({}),
                initial: '',
                required: true,
                errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldBoardTemplateInvalid)}
            },

            loginStrategy: {
                label: intl.formatMessage(messages.fieldLoginStrategyLabel),
                choices: [['ldapauth', 'LDAP'], ['local', 'Padrão']],
                widget: forms.Select({}),
                initial: 'ldapauth'
            },

            fieldType: {
                label: intl.formatMessage(messages.fieldFieldTypeLabel),
                choices: [['', 'Selecione o tipo do campo'], ['numeric', 'Numérico'], ['short_string', 'Texto curto até 100 caracteres'], ['text', 'Texto longo até 10000 caracteres'], ['dropdown', 'Dropdown'], ['date', 'Data'], ['datetime', 'Data e Hora']],
                widget: forms.Select({}),
                initial: '',
                required: true,
                errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldFieldTypeInvalid)}
            },

            showInCard: {
                label: intl.formatMessage(messages.fieldShowInCardLabel),
                choices: [['', 'Não exibir no cartão'], ['value', 'Exibir Valor']],
                widget: forms.Select({}),
                initial: '',
                required: false,
                errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldShowInCardInvalid)}
            },

            projectPhase: {
                label: intl.formatMessage(messages.fieldProjectPhaseLabel),
                choices: [['', 'Selecione a fase do projeto'], ['initiation', 'iniciação'], ['planning', 'planejamento'], ['execution', 'execução'], ['close', 'finalizado']],
                widget: forms.Select({}),
                initial: '',
                required: true,
                errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldProjectPhaseInvalid)}
            },
            laneType: {
                label: intl.formatMessage(messages.fieldLaneTypeLabel),
                choices: [['', 'Selecione o tipo de Raia'], ['aggregator', 'agregadora'], ['ready', 'pronto'], ['waiting', 'em espera'], ['inprogress', 'em progresso'], ['tracking', 'tracking'], ['completed', 'completada']],
                widget: forms.Select({}),
                initial: '',
                required: true,
                errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldLaneTypeInvalid)}
            },

            memberRole: {
                label: intl.formatMessage(messages.fieldMemberRoleLabel),
                choices: [['', 'Selecione o papel'], ['member', 'participante'], ['watcher', 'observador']],
                widget: forms.Select({}),
                initial: '',
                required: true,
                errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldMemberRoleInvalid)}
            },

            cardStatus: {
                label: intl.formatMessage(messages.fieldCardStatusLabel),
                choices: [['', 'Local onde será adicionado o cartão?'], [`${CardStatus.inboard.name}/${AddCardPosition.firstLaneInit.name}`, 'No Quadro - Início da Raia'], [`${CardStatus.inboard.name}/${AddCardPosition.firstLaneEnd.name}`, 'No Quadro - Final da Raia'], ['backlog', 'No Backlog']],
                widget: forms.Select({}),
                initial: '',
                required: true,
                errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldCardStatusInvalid)}
            },

            addSimpleCardTitle: {label: intl.formatMessage(messages.fieldTitleAddSimpleCardLabel), widget: forms.Textarea({attrs: {id: 'addSimpleCardTitleTextArea', rows: 3, cols: 40, maxLength: 100}}), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldTitleAddSimpleCardPlaceHolder)}, initial: '', required: true, maxLength: 100, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldTitleAddSimpleCardInvalid)}},

            cardTitle: {label: intl.formatMessage(messages.fieldCardTitleLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldCardTitlePlaceHolder)}, initial: '', required: true, maxLength: 100, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldCardTitleInvalid)}},
            cardImpedimentReason: {label: intl.formatMessage(messages.fieldCardImpedimentReasonLabel), widget: forms.Textarea({attrs: {rows: 6, cols: null, maxLength: 1000}}), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldCardImpedimentReasonPlaceHolder)}, initial: '', required: false, maxLength: 1000, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldCardImpedimentReasonInvalid)}},
            cardMetricValue: {label: intl.formatMessage(messages.fieldCardMetricValueLabel), widget: forms.NumberInput(), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldCardMetricValuePlaceHolder)}, initial: '', required: false, maxLength: 5, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldCardMetricValueInvalid)}},
            cardPriorityNumberValue: {label: intl.formatMessage(messages.fieldCardPriorityNumberValueLabel), widget: forms.NumberInput(), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldCardPriorityNumberValuePlaceHolder)}, initial: '', required: false, maxLength: 3, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldCardPriorityNumberValueInvalid)}},
            cardExternalId: {label: intl.formatMessage(messages.fieldCardExternalIdLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldCardExternalIdPlaceHolder)}, initial: '', required: false, maxLength: 50, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldCardExternalIdInvalid)}},
            cardExternalLink: {label: intl.formatMessage(messages.fieldCardExternalLinkLabel), widgetAttrs: {placeholder: intl.formatMessage(messages.fieldCardExternalLinkPlaceHolder)}, initial: '', required: false, maxLength: 500, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldCardExternalLinkInvalid)}},
            cardStartPlanningDate: {label: intl.formatMessage(messages.fieldCardStartPlanningDateLabel), widget: forms.DateInput({attrs: {type: 'date'}}), initial: '', required: false, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldCardStartPlanningDateInvalid)}},
            cardEndPlanningDate: {label: intl.formatMessage(messages.fieldCardEndPlanningDateLabel), widget: forms.DateInput({attrs: {type: 'date'}}), initial: '', required: false, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldCardEndPlanningDateInvalid)}},
            cardStartExecutionDate: {label: intl.formatMessage(messages.fieldCardStartExecutionDateLabel), widget: forms.DateInput({attrs: {type: 'date'}}), initial: '', required: false, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldCardStartExecutionDateInvalid)}},
            cardEndExecutionDate: {label: intl.formatMessage(messages.fieldCardEndExecutionDateLabel), widget: forms.DateInput({attrs: {type: 'date'}}), initial: '', required: false, errorMessages: {required: intl.formatMessage(messages.fieldRequired), invalid: intl.formatMessage(messages.fieldCardEndExecutionDateInvalid)}}

        };
    }
}
