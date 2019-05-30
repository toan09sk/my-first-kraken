/*Angular TestBed */

/*The TestBed creates a dynamically-constructed Angular test module that emulates an Angular @NgModule. */

/**To test a service, you set the providers metadata property with an array of the services that you'll test or mock. */

let service: ValueService;

beforeEach(() => {
  TestBed.configureTestingModule({ providers: [ValueService] });
  service = TestBed.get(ValueService);
});

it('should use ValueService', () => {
  service = TestBed.get(ValueService);
  expect(service.getValue()).toBe('real value');
});

/*When testing a service with a dependency, provide the mock in the providers array -- the mock is a spy object*/

let masterService: MasterService;
let valueServiceSpy: jasmine.SpyObj<ValueService>;

beforeEach(() => {
  const spy = jasmine.createSpyObj('ValueService', ['getValue']);

  TestBed.configureTestingModule({
    // Provide both the service-to-test and its (spy) dependency
    providers: [
      MasterService,
      { provide: ValueService, useValue: spy }
    ]
  });
  // Inject both the service-to-test and its (spy) dependency
  masterService = TestBed.get(MasterService);
  valueServiceSpy = TestBed.get(ValueService);
});

it('#getValue should return stubbed value from a spy', () => {
  const stubValue = 'stub value';
  valueServiceSpy.getValue.and.returnValue(stubValue);

  expect(masterService.getValue())
    .toBe(stubValue, 'service returned stub value');

  expect(valueServiceSpy.getValue.calls.count())
    .toBe(1, 'spy method was called once');

  expect(valueServiceSpy.getValue.calls.mostRecent().returnValue)
    .toBe(stubValue);
});

/*Testing HTTP services*/

let httpClientSpy: { get: jasmine.Spy };
let heroService: HeroService;
 
beforeEach(() => {
  // TODO: spy on other methods too
  httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
  heroService = new HeroService(<any> httpClientSpy);
});
 
it('should return expected heroes (HttpClient called once)', () => {
  const expectedHeroes: Hero[] =
    [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
 
  httpClientSpy.get.and.returnValue(asyncData(expectedHeroes));
 
  heroService.getHeroes().subscribe(
    heroes => expect(heroes).toEqual(expectedHeroes, 'expected heroes'), fail
  );

  expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');

});
 
it('should return an error when the server returns a 404', () => {
  const errorResponse = new HttpErrorResponse({
    error: 'test 404 error',
    status: 404, statusText: 'Not Found'
  });
 
  httpClientSpy.get.and.returnValue(asyncError(errorResponse));
 
  heroService.getHeroes().subscribe(
    heroes => fail('expected an error, not heroes'),
    error  => expect(error.message).toContain('test 404 error')
  );
});

/*The HeroService methods return Observables. You must subscribe to an observable to (a) cause it to execute and (b) assert that the method succeeds or fails.*/

/*HttpClientTestingModule*/

/*Import */

// Http testing module and mocking controller
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Other imports
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

/*Setup */
describe('HttpClient testing', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });

    // Inject the http service and test controller for each test
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });
  /// Tests begin ///
});

/*Expecting and answering requests*/
it('can test HttpClient.get', () => {
  const testData: Data = {name: 'Test Data'};

  // Make an HTTP GET request
  httpClient.get<Data>(testUrl)
    .subscribe(data =>
      // When observable resolves, result should match test data
      expect(data).toEqual(testData)
    );

  // The following `expectOne()` will match the request's URL.
  // If no requests or multiple requests matched that URL
  // `expectOne()` would throw.
  const req = httpTestingController.expectOne('/data');

  // Assert that the request is a GET.
  expect(req.request.method).toEqual('GET');

  // Respond with mock data, causing Observable to resolve.
  // Subscribe callback asserts that correct data was returned.
  req.flush(testData);

  // Finally, assert that there are no outstanding requests.
  httpTestingController.verify();
});
