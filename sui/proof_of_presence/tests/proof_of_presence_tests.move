#[test_only]
module proof_of_presence::proof_of_presence_tests {
    use std::string;
    use sui::test_scenario;
    use proof_of_presence::proof_of_presence::{Self, Certificate};

    #[test]
    fun mints_certificate_to_recipient() {
        let admin = @0xA;
        let recipient = @0xB;

        let mut scenario = test_scenario::begin(admin);
        {
            proof_of_presence::mint(
                recipient,
                string::utf8(b"Web3 & PoP 101"),
                string::utf8(b"Test Katilimci"),
                string::utf8(b"12 Aralik 2025"),
                string::utf8(b"EC-TEST-0001"),
                string::utf8(b"ipfs://test"),
                scenario.ctx(),
            );
        };

        // Sertifika alıcıya devredildi mi?
        scenario.next_tx(recipient);
        {
            let cert = scenario.take_from_sender<Certificate>();
            test_scenario::return_to_sender(&scenario, cert);
        };

        scenario.end();
    }
}
