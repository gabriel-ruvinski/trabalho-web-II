package br.ufpr.tads.validation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class CpfValidatorTest {

    private final CpfValidator validator = new CpfValidator();

    @ParameterizedTest
    @ValueSource(strings = {
            "39053344705", "11144477735", "12345678909", "98765432100", "52998224725"
    })
    void aceitaCpfComDigitosVerificadoresCorretos(String cpf) {
        assertTrue(validator.isValid(cpf, null));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "39053344706", "12345678900", "11111111111", "00000000000"
    })
    void rejeitaCpfComDigitoErradoOuSequenciaRepetida(String cpf) {
        assertFalse(validator.isValid(cpf, null));
    }

    @Test
    void deixaNuloEFormatoErradoParaOutrasValidacoes() {
        assertTrue(validator.isValid(null, null));
        assertTrue(validator.isValid("123", null));
        assertTrue(validator.isValid("390.533.447-05", null));
    }
}