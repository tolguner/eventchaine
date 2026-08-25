/// Proof of Presence — Soulbound katılım sertifikası.
///
/// lib/suiNFT.ts, mint fonksiyonunu şu argüman sırasıyla çağırır:
/// (recipient, event_title, participant_name, event_date, certificate_no, metadata_url).
/// Bu sıra değişirse arayüz tarafındaki moveCall çağrısı da güncellenmelidir.
module proof_of_presence::proof_of_presence {
    use std::string::String;
    use sui::event;

    /// Katılım sertifikası. `store` yeteneği yok: transfer edilemez, yalnızca
    /// mint sırasında alıcıya `transfer::transfer` ile devredilir.
    public struct Certificate has key {
        id: UID,
        event_title: String,
        participant_name: String,
        event_date: String,
        certificate_no: String,
        metadata_url: String,
    }

    public struct CertificateMinted has copy, drop {
        certificate_id: ID,
        recipient: address,
        certificate_no: String,
    }

    /// Yeni bir sertifika mint edip doğrudan alıcıya gönderir.
    /// Devredilemez olduğundan (soulbound) `store` yeteneği yoktur; alıcı
    /// dışında hiçbir adrese transfer edilemez.
    public fun mint(
        recipient: address,
        event_title: String,
        participant_name: String,
        event_date: String,
        certificate_no: String,
        metadata_url: String,
        ctx: &mut TxContext,
    ) {
        let certificate = Certificate {
            id: object::new(ctx),
            event_title,
            participant_name,
            event_date,
            certificate_no,
            metadata_url,
        };

        event::emit(CertificateMinted {
            certificate_id: object::id(&certificate),
            recipient,
            certificate_no: certificate.certificate_no,
        });

        transfer::transfer(certificate, recipient);
    }
}
