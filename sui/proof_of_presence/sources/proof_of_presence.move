/// Proof of Presence — Soulbound katılım sertifikası.
///
/// lib/suiNFT.ts, mint fonksiyonunu şu argüman sırasıyla çağırır:
/// (admin_cap, recipient, event_title, participant_name, event_date,
/// certificate_no, metadata_url). Bu sıra değişirse arayüz tarafındaki
/// moveCall çağrısı da güncellenmelidir.
module proof_of_presence::proof_of_presence {
    use std::string::String;
    use sui::event;

    /// Mint yetkisini elinde tutan yetenek nesnesi. Yalnızca paketi
    /// yayınlayan adrese (`init` sırasında) verilir; başka hiçbir adres
    /// bu nesneyi üretemez.
    public struct AdminCap has key, store {
        id: UID,
    }

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

    /// Paket yayınlandığında tek bir AdminCap üretilip yayınlayan adrese
    /// gönderilir. Bu adres, projede admin cüzdanı olarak kullanılan
    /// cüzdanla aynı olmalıdır (bkz. app/api/admin/wallet).
    fun init(ctx: &mut TxContext) {
        transfer::transfer(
            AdminCap { id: object::new(ctx) },
            ctx.sender(),
        );
    }

    /// Yalnızca testler için: init() dışında AdminCap üretmenin tek yolu.
    #[test_only]
    public fun create_admin_cap_for_testing(ctx: &mut TxContext): AdminCap {
        AdminCap { id: object::new(ctx) }
    }

    /// Yeni bir sertifika mint edip doğrudan alıcıya gönderir.
    /// Devredilemez olduğundan (soulbound) `store` yeteneği yoktur; alıcı
    /// dışında hiçbir adrese transfer edilemez.
    ///
    /// `_admin: &AdminCap` yalnızca sahip olunabilen bir nesneye referans
    /// olarak geçirilebildiği için, mint çağrısını yalnızca AdminCap'e
    /// sahip cüzdan yapabilir — yetki kontrolü artık zincir üzerinde.
    public fun mint(
        _admin: &AdminCap,
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
