Smart WebApplication Components

A imperative GUI component library for webpages.

To find out more about SWAC check this project out and copy the sourcefile to a webserver. The webpage includes full documentation and live examples.

To use SWAC easiest way is to use the SWACtemplate, see at its repository for more information.

Feel free to open tickets under issues if you find errors or wish new features.

## Changelog

### Version 05.12.2022

Fixed: 
- BindPoint:
	- BindPoint creation registers unneccessery eventListeners
	- Solved problem with empty bindpoints
- Edit: 
	- Example 7 code uses wrong datasource for definitions
- View (all present components):
	- repeatedForAttr s are not created
	- Placeholder filled double times if there are more than one placeholder in one tag
	- More than one placeholder in attributes is not replaced
- Documentation:
	- Wrong documentation on how to use language entries in templates
- Wrong calcualted site root in some cases
- ComponentHandler: Unneccessery options loading when component has error
- ViewHandler: When id is missing on requestor there is no error message

Changed: 
- completeDefinitionsFromHTML() is now optional, and must be activated by option if wanted
- Component: getDataDefinitionsForDatasource() no longer returns swac_* attributes
- UIkit to version 3.15.14
- Documentation
	- Updated sample component with default deactivated sample plugin

Added: 
- Present: TableSort plugin
- Present: TableFilter plugin
- WatchableSet: Automatic garbage collection of dead observers
- Documentation
	- Documentation how to use components and language entries in plugins
	- Documentation page for Sample plugin
	- ExplainComponents: Support for example values in documentation
	- Support for example values in documentation
	- ExplainComponents: Automatic documentation for plugins
	- Plugins: Documentation for writign plugins extended with info about swac_repeatForPluginNav
	- Plugins: Documentation extendet with info about plugins html templates
- License and developer documentation to components
- ExplainComponent: Documenting license and developers
- License and library information page
- Sample: Javascript documentation
- Support for subcomponents in plugins 
- Mediaplayer: 
	- Headline to playlist
	- Mark active playing title
	- License info output
	- Updated templates
	- Updated translation
	- Possibility to link to title pages
	- Option to set a base path for media files
	- Display artists info
	- Hide control elements on print
