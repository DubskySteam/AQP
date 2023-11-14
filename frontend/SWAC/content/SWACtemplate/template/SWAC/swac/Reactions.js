/* 
 * Class for registering and handling reactions
 */
class Reactions {
    constructor() {
        this.reactions = [];
    }

    /**
     * Registers a reaction to requestor loads. Those can be bound to more than one 
     * requestor.
     * 
     * @param {Function} reactionfunction Function to execute, when all given requestors are loaded
     * @param {String} requestor_id ID of the requestor(s)
     * @returns {undefined}
     */
    addReaction(reactionfunction, ...requestor_id) {
        let reaction = {};
        reaction.function = reactionfunction;
        reaction.requiredRequestors = [];
        for (let curRequestorId of requestor_id) {
            reaction.requiredRequestors.push(curRequestorId);
        }
        this.reactions.push(reaction);
    }

    /**
     * Performs the registred reactions to requestor loads
     * This calls the registred function, if all required requestors are loaded.
     * The called method becomes a object with references to all required requestors.
     * 
     * @returns {undefined}
     */
    performReactions() {
        let remaining = [];
        for (let i in this.reactions) {
            let curReaction = this.reactions[i];
            // Check if all required requestors are loaded
            let allLoaded = true;
            let requestors = {};
            for (let requiredRequestor of curReaction.requiredRequestors) {
                if (!SWAC.loadedcomponents.includes(requiredRequestor)) {
                    allLoaded = false;
                    break;
                }
                let requestor = document.getElementById(requiredRequestor);
                if (requestor === null) {
                    Msg.error('swac.js', 'The requestor >' + requiredRequestor
                            + '< was not found in document. These means usually that another script has removed it.'
                            + ' Therefore the reaction to >' + curReaction.requiredRequestors + '< could not be performed.');
                    allLoaded = false;
                    break;
                }
                // Put requstor to requestors array
                requestors[requiredRequestor] = document.getElementById(requiredRequestor);
            }
            // If all loaded execute function
            if (allLoaded) {
                curReaction.function(requestors);
            } else {
                remaining.push(curReaction);
            }
        }

        // Remove reaction to avoid double execution
        this.reactions = remaining;
    }
}

// Activate reaction mechanism
var SWAC_reactions = new Reactions();