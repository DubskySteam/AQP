package de.fhbielefeld.scl.rest;

/**
 *
 * @author dstarke <dstarke@fh-bielefeld.de>
 */
import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)

// add more Classes to test
@Suite.SuiteClasses({
    GenericRESTTest.class,
    DataResourceTest.class,
    DataTemplateResourceTest.class,
    ExchangeClientResourceTest.class,
    ExchangeConfigurationResourceTest.class,
    ExchangeServerResourceTest.class,
    MeasurementTypeResourceTest.class,
    ObservedObjectMetadataResourceTest.class,
    ObservedObjectMetadataTypeResourceTest.class,
    ObservedObjectResourceTest.class,
//  ObservedObjectTypeJoinMetadataTypeResourceTest.class,
    ObservedObjectTypeResourceTest.class,
    TagFileResourceTest.class,
    TagObservedObjectResourceTest.class,
    TagTypeResourceTest.class,
    UserResourceTest.class,
    ValueDefinitionResourceTest.class,
    ZSystemTestResourceTest.class
})

public class ZTestSuite {
}
