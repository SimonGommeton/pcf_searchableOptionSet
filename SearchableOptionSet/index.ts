import { Context } from "vm";
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class SearchableOptionSet implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	//PCF Elements
	private context: ComponentFramework.Context<IInputs>;
	private _notifyOutputChanged: () => void;

	//Source OptionSet
	private sourceOptionSet: ComponentFramework.PropertyTypes.OptionSetProperty;
	private defaultValue: number;
	private defaultOption: number | any;
	private entityId: any;

	//Target OptionSet
	private targetOptionSet: HTMLDataListElement;
	private targetOptionSet_Input : HTMLInputElement;
	private buildingString: string;
	private sourceOptions: Array<any>;
	private tempTargetOptionNb: number;

	//Img Element
	private imgElement: HTMLImageElement;
	
	//Divs
	private flexContainer: HTMLDivElement;
	private imgContainer: HTMLDivElement;
	private datalistContainer: HTMLDivElement;

	//Security
	private securityReadable: boolean | undefined;
	private securityEditable: boolean | undefined;
	private isReadOnly: boolean;

	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
	{

		this._notifyOutputChanged = notifyOutputChanged;

		this.sourceOptionSet = context.parameters.InputOptionSet;
		this.entityId = (<any>context.mode).contextInfo.entityId;

		this.defaultOption = this.sourceOptionSet.raw || null;
		this.defaultValue = this.sourceOptionSet.attributes?.DefaultValue!;

		let sourceOptions = new Array<ComponentFramework.PropertyHelper.OptionMetadata>();

		this.sourceOptionSet.attributes?.Options.forEach((e) => {		
			sourceOptions.push(e);
		});

		let isSorted: string = context.parameters.AlphabeticalOrder?.raw || "1";
			if(isSorted == "1"){
				sourceOptions.sort((a, b) => a.Label.localeCompare(b.Label));;
			}

		this.sourceOptions = sourceOptions

		let datalistGUID: string = this.GenerateDatalistGUID(); 

		this.targetOptionSet = document.createElement('datalist');
		this.targetOptionSet.setAttribute("id", datalistGUID);
		this.targetOptionSet.setAttribute("class", "TargetOptionSet");

		this.targetOptionSet_Input = document.createElement('input');
		this.targetOptionSet_Input.type = "text";
		this.targetOptionSet_Input.setAttribute("list", datalistGUID);
		this.targetOptionSet_Input.setAttribute("id", "searchBox");
		this.targetOptionSet_Input.autocomplete = "off";
		this.targetOptionSet_Input.placeholder = context.parameters.SearchBoxPlaceholder.raw || "---";

		this.buildingString = "";

		this.TreatTargetOptionSet(this.targetOptionSet, this.sourceOptions, this.defaultOption, this.defaultValue, this.buildingString, this.entityId);

		this.flexContainer = document.createElement("div");
		this.flexContainer.setAttribute("class", "flexContainer");

		this.imgElement = document.createElement("img");
		context.resources.getResource("MagnifyingGlass.png", this.setImage.bind(this, false, "png"), this.showError.bind(this));

		this.imgContainer = document.createElement("div");
		this.imgContainer.setAttribute("class", "imgContainer");

		this.datalistContainer = document.createElement("div");
		this.datalistContainer.setAttribute("class", "datalistContainer");

		this.targetOptionSet_Input.addEventListener("change", this.onOptionChange.bind(this));
		this.targetOptionSet_Input.addEventListener("blur", this.onBlur.bind(this));

		container.appendChild(this.flexContainer);
		this.flexContainer.appendChild(this.imgContainer)
		this.imgContainer.appendChild(this.imgElement);
		this.flexContainer.appendChild(this.datalistContainer)
		this.datalistContainer.appendChild(this.targetOptionSet_Input);
		this.datalistContainer.appendChild(this.targetOptionSet);
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void{

		if(context.mode.isControlDisabled){
			this.isReadOnly = true; 
			this.DisableTargetOptionSet();
		}

		this.targetOptionSet.hidden = !context.mode.isVisible;

		this.securityReadable = context.parameters.InputOptionSet.security?.readable;
		this.securityEditable = context.parameters.InputOptionSet.security?.editable;
		
		if(!this.securityReadable){
		this.targetOptionSet_Input.style.visibility = "hidden";
		}

		if(!this.securityEditable){
			this.isReadOnly = true;
			this.DisableTargetOptionSet();
		}		
	}

	/**
	 * It is called by the framework prior to a control receiving new data.
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			InputOptionSet: this.tempTargetOptionNb
		};
	}

	/**
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
	}

	 /** 
	 * METHODS
	 */

	public GenerateDatalistGUID(): string{

		var dt = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (dt + Math.random()*16)%16 | 0;
			dt = Math.floor(dt/16);
			return (c=='x' ? r :(r&0x3|0x8)).toString(16);
		});

	return uuid;	  
	}

	public TreatTargetOptionSet(TargetOptionSet: HTMLDataListElement, sourceOptionArray: Array<ComponentFramework.PropertyHelper.OptionMetadata>, defaultOption: number, defaultValue: number,
		 optionString: string, EntityId: any): void{

			optionString += '<option id ="-1" value="--Select--" />';		

			for (var j = 0; j < sourceOptionArray.length; j++){
				optionString += '<option id ="' + sourceOptionArray[j].Value + '"value="' + sourceOptionArray[j].Label + '" />';

				var isSelected = false;

				if(defaultOption == sourceOptionArray[j].Value ){
					this.targetOptionSet_Input.value = sourceOptionArray[j].Label;
					isSelected = true
				}

				if(defaultValue == sourceOptionArray[j].Value && !isSelected && EntityId == undefined){
					this.targetOptionSet_Input.value = sourceOptionArray[j].Label;
				}
			}

			TargetOptionSet.innerHTML = optionString;
	}

	public DisableTargetOptionSet(): void{

		for(var i = 0; this.targetOptionSet.options.length; i++){
			this.targetOptionSet.options[i].disabled = true;
		}

		this.targetOptionSet_Input.disabled = true;
		this.targetOptionSet_Input.readOnly = true;
	}

	public onOptionChange(): void {

		this.targetOptionSet.style.fontWeight = "normal";

		if(this.isReadOnly){return;}
			if(this.IsInputInDatalist(this.targetOptionSet_Input.value)){
				this.tempTargetOptionNb = Number(document.querySelector('option[value="' +  this.targetOptionSet_Input.value + '"]')?.id);
				this._notifyOutputChanged();
			}		
	}

	public IsInputInDatalist(Input: string): boolean{

		for(var i = 0; this.targetOptionSet.options.length; i++){
			if(Input == this.targetOptionSet.options[i].value){
				return true;
			} 
		}
		return false;		
	}

	public onBlur() : void {

		if(this.targetOptionSet_Input.value == "--Select--"){
			this.targetOptionSet_Input.value = "";
		} 
	}

	private showError(): void{

		console.log("The component img could not be found");
	}

	private setImage(shouldUpdateOutput:boolean, fileType: string, fileContent: string): void{

		let imageUrl:string = this.generateImageSrcUrl(fileType, fileContent);
		this.imgElement.src = imageUrl;
	}

	private generateImageSrcUrl(fileType: string, fileContent: string): string{

		return  "data:image/" + fileType + ";base64, " + fileContent;
	}

}