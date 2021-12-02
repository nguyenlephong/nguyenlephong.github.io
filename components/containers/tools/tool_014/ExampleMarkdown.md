# PDropdown

## How to using it?
- Import
```
import PDropdown from 'shared/components/p-elements/dropdown/PDropdown';
```
- Using

```
<PDropdown
    id={'cp__dropdown-btn-status-filter'}
    optionKey={`cp__pd--f-status`}
    key={toSegment}
    type={'checkbox'}
    isLoading={!allItemSegment}
    getPopupContainer={true}
    btnClassName={`${classCssWrapper}__btn-dropdown`}
    titleClassName={`${classCssWrapper}__btn-dropdown-label`}
    onChange={(valueChange) => onFilterDataCampaign(valueChange, 'arrStatusFilterData', 'optsForStatusFilter')}
    options={optsForStatusFilter}
    value={getDefaultValue(arrStatusFilterData, 'STATUS')}
    placeholder={getDefaultValue(arrStatusFilterData, 'STATUS')}
    isConvertName={true}
    targetPopupContainer={document.getElementsByClassName('cdp-segment-step01__child-query')[0]}
/>
  );
```

- Declare props

|#ID    |Property               |Description                                |Type                                   |Default  Value  |
|---    |---                    |---                                        |---                                    |---             |
|1.     |id                     |DOM id                                     |string                                 |-               |
|2.     |optionKey              |DOM option id                              |string                                 |-               |
|3.     |key                    |React key (Rendering Multiple Components)  |string                                 |-               |
|4.     |type                   |Multiple choice or not                     |`default` &#124; `checkbox`            |`default`       |
|5.     |isLoading              |Set the loading status of dropdown         |boolean                                |false           |
|6.     |isConvertName          |Using 'name' to display instead of 'value' |boolean                                |false           |
|7.     |onChange               |Set the handler to handle `onChange` event |`(val: string, obj: Object) => void`   |-               |
|8.     |options                |Options list                               |`{name: string ,val: string}[]`        |`[]`            |
|9.     |placeholder            |Placeholder                                |string                                 |-               |
|10.    |value                  |Current selected option                    |string                                 |-               |
|11.    |btnClassName           |Button class name                          |string                                 |-               |
|12.    |titleClassName         |Title class name                           |string                                 |-               |
|13.    |getPopupContainer      |Parent Node which the selector should be rendered to. |boolean                     |false           |
|14.    |targetPopupContainer   |Target which the selector should be rendered to       |ReactNode                   |-               |

- Notes: