package de.fhbielefeld.scl.logger.process;

import de.fhbielefeld.scl.logger.message.Message;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents an process containing a number of Messages.
 *
 * @author ffehring
 */
public class Process {

    private long id;
    private String name;
    private LocalDateTime starttime;
    private LocalDateTime endtime;

    private List<Message> _messages = new ArrayList<>();

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getStarttime() {
        return starttime;
    }

    public void setStarttime(LocalDateTime starttime) {
        this.starttime = starttime;
    }

    public LocalDateTime getEndtime() {
        return endtime;
    }

    public void setEndtime(LocalDateTime endtime) {
        this.endtime = endtime;
    }

    public List<Message> getMessages() {
        return _messages;
    }

    public void setMessages(List<Message> messages) {
        this._messages = messages;
    }
    
    public void addMessage(Message message) {
        if(!this._messages.contains(message)) {
            this._messages.add(message);
            message.setMessageProcess(this);
        }
    }
}
