# unit test reporter
Create an annotation of the build information and also list first n failed tests.  Currently supports nunit and trx formats.

Example
```yaml
  - uses: edwinf/unit-nunit-reporter@v1.0.0
      if: always()
      with: 
        path: 'test-resuls/*.xml'
        reportType: 'trx'
        access-token: ${{secrets.GITHUB_TOKEN}}
```



This project has been [mirror forked](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/duplicating-a-repository#mirroring-a-repository) from [MirrorNG/nunit-reporter](https://github.com/MirrorNG/nunit-reporter).
