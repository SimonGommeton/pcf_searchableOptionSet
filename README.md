# pcf_searchableOptionSet

![PCF_SearchableOptionSet](https://user-images.githubusercontent.com/53188636/124472861-e9ae0800-dd9e-11eb-9bbc-8da1b8ad2389.gif)

## Searchable Option Set
This component provides **PowerApps** users with a searchable and customizable OptionSet.
The component can be manually imported into the CDS using the solution file provided.

## Parameters
The component is compatible with the **_OptionSet_** data type in **CDS**.

Users can modify the Searchbox's placeholder to any text modifying the "SearchBoxPlaceholder" parameter.
They can also choose whether the component will or will not sort the options in alphabetical order, by switching the "AlphabeticalOrder" parameter.

## Other modifications

If users wish to go further in the customization of the component, they will need to modify the code and build a new solution.
This will be the case for picture modification or CSS enhancements.

## Installation

### Requirements

First of all, users need to have installed:     
* [nodes.js](https://nodejs.org/en/download/)
* [.NET Framework 4.6.2 Developer Pack](https://dotnet.microsoft.com/download/dotnet-framework/net462)
* [Visual Studio 2017 or later](https://docs.microsoft.com/en-us/visualstudio/install/install-visual-studio?view=vs-2017) 
  OR [.NET Core 3.1 SDK ](https://dotnet.microsoft.com/download/dotnet-core/current) + [Visual Studio Code](https://code.visualstudio.com/Download)
* [PowerApps CLI](https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/powerapps-cli)

PowerApps CLI should be updated to its latest version:    
<pre>pac install latest</pre>    

### Building the component

Extract the current rep into a new folder, then open the Developer Command Prompt and search its path. Run:            
<pre>npm install</pre>

In case vulnerabilities are found, run:   
<pre>npm audit fix</pre>

Then build the solution, using:
<pre>msbuild /t:build /restore</pre>  

Create your authentication profile using the command:
<pre>pac auth create --url https://xyz.crm.dynamics.com</pre>

The command prompt will ask for credentials.
Finally, deploy the component, using the push command:    
<pre>pac pcf push --publisher-prefix <your publisher prefix></pre>

