const EVENTS = {
  'mapInteractionEnabled': new CustomEvent('mapInteractionEnabled'),
  'mapInteractionDisabled': new CustomEvent('mapInteractionDisabled'),
  'mapClickInteractionEnabled': new CustomEvent('mapClickInteractionEnabled'),
  'mapClickInteractionDisabled': new CustomEvent('mapClickInteractionDisabled'),
}
export default EVENTS;