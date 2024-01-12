package de.fhbielefeld.scl.mail;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.smartuser.config.Configuration;
import jakarta.activation.DataSource;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Properties;
import jakarta.mail.Authenticator;
import jakarta.mail.Multipart;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Transport;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMultipart;
import de.fhbielefeld.scl.logger.message.MessageLevel;

/**
 * Mailer for sending mails
 *
 * @author Florian Fehring
 */
public class Mailer {

    private Configuration conf;

    public Mailer(Configuration conf) {
        this.conf = conf;
    }

    /**
     * Send an email to a reciver useing the default send values from
     * configuration
     *
     * @param to Recivers email(s) "email_1@yahoo.com, email_2@gmail.com"
     * @param to_cc Copy recivers mail(s)
     * @param subject Message subject
     * @param content Message HTML content
     * @return Response deliverd by the server
     * @throws de.fhbielefeld.scl.mail.MailerException
     */
    public String send(String to, String to_cc, String subject, String content) throws MailerException {
        // Create send properties
        Properties properties = new Properties();
        properties.put("mail.transport.protocol", "smtp");
        properties.put("mail.smtp.host", this.conf.getProperty("email_smtp_host"));
        properties.put("mail.smtp.port", this.conf.getProperty("email_smtp_port"));
        properties.put("mail.smtp.auth", this.conf.getProperty("email_smtp_auth"));
        properties.put("mail.smtp.user", this.conf.getProperty("email_smtp_user"));
        properties.put("mail.smtp.password", this.conf.getProperty("email_smtp_password"));
        properties.put("mail.smtp.starttls.enable", this.conf.getProperty("email_smtp_tls"));
        
        Session session = Session.getInstance(properties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(properties.getProperty("mail.smtp.user"),
                        properties.getProperty("mail.smtp.password"));
            }
        });
        
        Message msg = new MimeMessage(session);
        String response = null;
        try {
            if(this.conf.getProperty("email_smtp_sender") == null) {
                de.fhbielefeld.scl.logger.message.Message err = new de.fhbielefeld.scl.logger.message.Message(
                        ">email_smtp_sender< is missing in configuration >"+this.conf.getFileName()+"<",MessageLevel.ERROR);
                Logger.addMessage(err);
                return null;
            }
            msg.setFrom(new InternetAddress(this.conf.getProperty("email_smtp_sender")));
            msg.setRecipients(Message.RecipientType.TO,
                    InternetAddress.parse(to));
            msg.setSubject(subject);
            // HTML email
            MimeBodyPart mimeBodyPart = new MimeBodyPart();
            mimeBodyPart.setContent(content, "text/html; charset=utf-8");
            Multipart multipart = new MimeMultipart();
            multipart.addBodyPart(mimeBodyPart);
            msg.setContent(multipart);
            Transport.send(msg);
        } catch (MessagingException ex) {
            MailerException me = new MailerException("Could not send mail because of: " + ex.getLocalizedMessage());
            me.addSuppressed(ex);
            throw me;
        }
        return response;
    }

    static class HTMLDataSource implements DataSource {

        private String html;

        public HTMLDataSource(String htmlString) {
            html = htmlString;
        }

        @Override
        public InputStream getInputStream() throws IOException {
            if (html == null) {
                throw new IOException("html message is null!");
            }
            return new ByteArrayInputStream(html.getBytes());
        }

        @Override
        public OutputStream getOutputStream() throws IOException {
            throw new IOException("This DataHandler cannot write HTML");
        }

        @Override
        public String getContentType() {
            return "text/html";
        }

        @Override
        public String getName() {
            return "HTMLDataSource";
        }
    }
}
