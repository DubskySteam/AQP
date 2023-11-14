package de.smartdata.porter.result;

import de.fhbielefeld.scl.logger.message.Message;
import java.util.ArrayList;
import java.util.List;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;

/**
 * Abstract class for Results
 * 
 * @author ffehring
 */
@XmlRootElement
public abstract class Result {
    
    @XmlTransient
    protected List<Message> messages = new ArrayList<>();

    public List<Message> getMessages() {
        return messages;
    }

    public void setMessages(List<Message> _messages) {
        this.messages = _messages;
    }
    
    public void addMessage(Message message) {
        this.messages.add(message);
    }
}
