<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class ApplicationSubmittedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $applicant;
    public $program;

    /**
     * Create a new message instance.
     */
    public function __construct(User $applicant, $program)
    {
        $this->applicant = $applicant;
        $this->program = $program;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Application Received - SMI Institute Inc.',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.application-submitted',
            with: [
                'name' => $this->applicant->first_name . ' ' . $this->applicant->last_name,
                'email' => $this->applicant->email,
                'program' => $this->program,
                'submittedAt' => $this->applicant->created_at->format('F d, Y h:i A'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
